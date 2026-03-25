import { getContacts, searchContacts } from "../services/contacts.services.js";

export const getAllContactsController = async (req, res) => {
  try {
    const data = await getContacts();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener contactos:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const searchContactsController = async (req, res) => {
  try {
    const {
      nombre = "",
      cargo = "",
      empresa = "",
      pais = ""
    } = req.query;

    const data = await searchContacts({ nombre, cargo, empresa, pais });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error al buscar contactos:", error.message);
    return res.status(500).json({ error: error.message });
  }
};