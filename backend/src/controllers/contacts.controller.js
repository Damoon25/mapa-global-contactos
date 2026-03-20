const pool = require("../config/db");

const getAllContacts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo contactos:", error.message);
    res.status(500).json({ error: "Error obteniendo contactos" });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM contacts WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo contacto:", error.message);
    res.status(500).json({ error: "Error obteniendo contacto" });
  }
};

const createContact = async (req, res) => {
  try {
    const {
      country_name,
      country_code,
      phone_prefix,
      lat,
      lng,
      name,
      role,
      company,
      phone,
      email
    } = req.body;

    if (!country_name || !name) {
      return res.status(400).json({
        error: "country_name y name son obligatorios"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO contacts
      (country_name, country_code, phone_prefix, lat, lng, name, role, company, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        country_name,
        country_code || null,
        phone_prefix || null,
        lat || null,
        lng || null,
        name,
        role || null,
        company || null,
        phone || null,
        email || null
      ]
    );

    res.status(201).json({
      message: "Contacto creado correctamente",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error creando contacto:", error.message);
    res.status(500).json({ error: "Error creando contacto" });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      country_name,
      country_code,
      phone_prefix,
      lat,
      lng,
      name,
      role,
      company,
      phone,
      email
    } = req.body;

    const [result] = await pool.query(
      `
      UPDATE contacts
      SET
        country_name = ?,
        country_code = ?,
        phone_prefix = ?,
        lat = ?,
        lng = ?,
        name = ?,
        role = ?,
        company = ?,
        phone = ?,
        email = ?
      WHERE id = ?
      `,
      [
        country_name,
        country_code || null,
        phone_prefix || null,
        lat || null,
        lng || null,
        name,
        role || null,
        company || null,
        phone || null,
        email || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    res.json({ message: "Contacto actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando contacto:", error.message);
    res.status(500).json({ error: "Error actualizando contacto" });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM contacts WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    res.json({ message: "Contacto eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando contacto:", error.message);
    res.status(500).json({ error: "Error eliminando contacto" });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};