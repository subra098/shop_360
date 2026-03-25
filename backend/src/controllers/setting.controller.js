import prisma from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Return as key-value object for easy consumption
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const upsertSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
