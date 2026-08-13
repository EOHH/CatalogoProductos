const fs = require('fs');
const content = fs.readFileSync('src/types/database.types.ts', 'utf8');
const fixed = content
  .replace(/Insert: Omit<Database\['public'\]\['Tables'\]\['(.*?)'\]\['Row'\], .*?> & \{ .*? \}/g, "Insert: Partial<Database['public']['Tables']['$1']['Row']>")
  .replace(/Update: Partial<Database\['public'\]\['Tables'\]\['(.*?)'\]\['Insert'\]>/g, "Update: Partial<Database['public']['Tables']['$1']['Row']>");
fs.writeFileSync('src/types/database.types.ts', fixed);
