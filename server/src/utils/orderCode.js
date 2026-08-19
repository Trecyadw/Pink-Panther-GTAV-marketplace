export function generateOrderCode() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  
  // Mengubah NR menjadi PP (Pink Panther)
  return `PP-${y}${m}${day}-${rand}`;
}