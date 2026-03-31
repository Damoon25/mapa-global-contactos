import * as XLSX from "xlsx";
import {
    createContact,
    findExistingContact,
    getCitiesForImport,
    getCountries,
    getProvincesByCountry,
} from "../api/contactsApi";

const normalizeText = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const findBestMatch = (items, field, value) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) return null;

    const exactMatch = items.find(
        (item) => normalizeText(item?.[field]) === normalizedValue,
    );

    if (exactMatch) return exactMatch;

    const partialMatch = items.find((item) =>
        normalizeText(item?.[field]).includes(normalizedValue),
    );

    if (partialMatch) return partialMatch;

    const reversePartialMatch = items.find((item) =>
        normalizedValue.includes(normalizeText(item?.[field])),
    );

    return reversePartialMatch ?? null;
};

export async function importContactsFromExcel(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const contactosSheet = workbook.Sheets["contactos"];
    const empleadosSheet = workbook.Sheets["empleados"];

    if (!contactosSheet) {
        throw new Error("El archivo no tiene la hoja 'contactos'.");
    }

    const contactos = XLSX.utils.sheet_to_json(contactosSheet, {
        defval: "",
    });

    const empleados = empleadosSheet
        ? XLSX.utils.sheet_to_json(empleadosSheet, { defval: "" })
        : [];

    const countries = await getCountries();

    let created = 0;
    let duplicated = 0;
    let failed = 0;

    const failedRows = [];

    for (let index = 0; index < contactos.length; index += 1) {
        const row = contactos[index];
        const rowNumber = index + 2;

        try {
            const nombre = String(row.nombre ?? "").trim();
            const paisNombre = String(row.pais ?? "").trim();
            const provinciaNombre = String(row.provincia ?? "").trim();
            const ciudadNombre = String(row.ciudad ?? "").trim();

            if (!nombre) {
                failed += 1;
                failedRows.push({
                    fila: rowNumber,
                    contacto_ref: row.contacto_ref || "",
                    nombre: "",
                    motivo: "Falta el nombre del contacto.",
                });
                continue;
            }

            if (!paisNombre) {
                failed += 1;
                failedRows.push({
                    fila: rowNumber,
                    contacto_ref: row.contacto_ref || "",
                    nombre,
                    motivo: "Falta el país.",
                });
                continue;
            }

            const country = findBestMatch(countries, "nombre", paisNombre);

            if (!country) {
                failed += 1;
                failedRows.push({
                    fila: rowNumber,
                    contacto_ref: row.contacto_ref || "",
                    nombre,
                    motivo: `No se encontró el país '${paisNombre}'.`,
                });
                continue;
            }

            let provinceId = null;

            if (provinciaNombre) {
                const provinces = await getProvincesByCountry({
                    paisId: country.id,
                });

                const province = findBestMatch(provinces, "nombre", provinciaNombre);

                if (!province) {
                    failed += 1;
                    failedRows.push({
                        fila: rowNumber,
                        contacto_ref: row.contacto_ref || "",
                        nombre,
                        motivo: `No se encontró la provincia '${provinciaNombre}' para '${paisNombre}'.`,
                    });
                    continue;
                }

                provinceId = province.id;
            }

            let cityId = null;

            if (ciudadNombre) {

                let cities = await getCitiesForImport({
                    paisId: country.id,
                    provinciaId: provinceId,
                });

                let city = findBestMatch(cities, "name", ciudadNombre);

                // 🔥 fallback si no encuentra con provincia
                if (!city) {
                    cities = await getCitiesForImport({
                        paisId: country.id,
                        provinciaId: null,
                    });

                    city = findBestMatch(cities, "name", ciudadNombre);
                }

                if (!city) {
                    failed += 1;
                    failedRows.push({
                        fila: rowNumber,
                        contacto_ref: row.contacto_ref || "",
                        nombre,
                        motivo: `No se encontró la ciudad '${ciudadNombre}'.`,
                    });
                    continue;
                }

                cityId = city.id;
            }

            const existingContact = await findExistingContact({
                email: row.email,
                nombre: row.nombre,
                empresa: row.empresa,
                paisId: country.id,
                ciudadId: cityId,
            });

            if (existingContact) {
                duplicated += 1;
                continue;
            }

            const empleadosAsociados = empleados
                .filter(
                    (empleado) =>
                        String(empleado.contacto_ref ?? "").trim() ===
                        String(row.contacto_ref ?? "").trim(),
                )
                .map((empleado) => ({
                    nombre: empleado.nombre,
                    cargo: empleado.cargo,
                    telefono: empleado.telefono,
                    email: empleado.email,
                }))
                .filter((empleado) => String(empleado.nombre ?? "").trim());

            await createContact({
                pais_id: country.id,
                provincia_id: provinceId,
                ciudad_id: cityId,
                nombre: row.nombre,
                cargo: row.cargo,
                empresa: row.empresa,
                direccion: row.direccion,
                telefono: row.telefono,
                email: row.email,
                lat: row.lat,
                lng: row.lng,
                empleados: empleadosAsociados,
            });

            created += 1;
        } catch (error) {
            failed += 1;

            failedRows.push({
                fila: rowNumber,
                contacto_ref: row.contacto_ref || "",
                nombre: row.nombre || "",
                motivo: error?.message || "Error desconocido al importar la fila.",
            });

            console.error("Error importando fila:", row, error);
        }
    }

    return {
        total: contactos.length,
        creados: created,
        duplicados: duplicated,
        fallidos: failed,
        failedRows,
    };
}