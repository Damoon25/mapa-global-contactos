import * as XLSX from "xlsx";

const buildContactRef = (contact, index) => {
    return `CONTACTO_${contact?.id ?? index + 1}`;
};

export function exportContactsToExcel(contacts = []) {
    const safeContacts = Array.isArray(contacts) ? contacts : [];

    const contactosSheetData = safeContacts.map((contact, index) => ({
        contacto_ref: buildContactRef(contact, index),
        id: contact.id ?? "",
        nombre: contact.nombre ?? "",
        cargo: contact.cargo ?? "",
        empresa: contact.empresa ?? "",
        telefono: contact.telefono ?? "",
        email: contact.email ?? "",
        direccion: contact.direccion ?? "",
        pais: contact.paises?.nombre ?? "",
        provincia: contact.provincias?.nombre ?? "",
        ciudad: contact.ciudades?.name ?? "",
        lat: contact.lat ?? "",
        lng: contact.lng ?? "",
    }));

    const empleadosSheetData = safeContacts.flatMap((contact, index) => {
        const contactoRef = buildContactRef(contact, index);
        const empleados = Array.isArray(contact.empleados) ? contact.empleados : [];

        if (empleados.length === 0) {
            return [];
        }

        return empleados.map((empleado) => ({
            contacto_ref: contactoRef,
            contacto_id: contact.id ?? "",
            nombre: empleado.nombre ?? "",
            cargo: empleado.cargo ?? "",
            telefono: empleado.telefono ?? "",
            email: empleado.email ?? "",
        }));
    });

    const workbook = XLSX.utils.book_new();

    const contactosWorksheet = XLSX.utils.json_to_sheet(contactosSheetData);
    const empleadosWorksheet = XLSX.utils.json_to_sheet(empleadosSheetData);

    XLSX.utils.book_append_sheet(workbook, contactosWorksheet, "contactos");
    XLSX.utils.book_append_sheet(workbook, empleadosWorksheet, "empleados");

    const today = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    const fileDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
        today.getDate(),
    )}`;

    XLSX.writeFile(workbook, `mapa-global-contactos-${fileDate}.xlsx`);
}