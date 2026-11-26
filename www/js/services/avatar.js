// Foto de perfil: recorta en cuadrado, comprime en el celular y la sube a Supabase Storage.
// En modo demo (sin sesión) la foto solo se muestra mientras la app esté abierta.
import { state } from '../store.js';
import { getClient } from './supabase.js';

const BUCKET = 'avatars';
const SIDE = 400;          // la foto final mide 400 x 400 px
const QUALITY = 0.85;      // calidad JPEG

/** Lee la imagen elegida, la recorta al centro en cuadrado y la reduce. Devuelve un Blob JPEG. */
function compress(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = SIDE;
      canvas.height = SIDE;
      canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, SIDE, SIDE);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.'))),
        'image/jpeg',
        QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Esa imagen no se puede abrir. Prueba con otra.'));
    };
    img.src = url;
  });
}

function friendly(err) {
  const msg = err?.message || String(err);
  if (msg.includes('Bucket not found')) return 'Falta crear la carpeta de fotos en Supabase (SQL v4).';
  if (msg.includes('avatar_url')) return 'Falta agregar la columna de foto en Supabase (SQL v4).';
  if (msg.includes('row-level security') || msg.includes('Unauthorized')) return 'Sin permiso para subir la foto (revisa el SQL v4).';
  return msg;
}

/** Sube la foto y la guarda en el perfil. Actualiza state.user.avatarUrl. */
export async function uploadAvatar(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Elige una imagen.');
  const blob = await compress(file);

  const sb = getClient();
  if (!sb || !state.session) {            // modo demo: solo local
    state.user.avatarUrl = URL.createObjectURL(blob);
    return;
  }

  try {
    const id = state.session.userId;
    const path = `${id}/avatar.jpg`;

    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true, cacheControl: '3600' });
    if (upErr) throw upErr;

    // "?v=" cambia en cada subida para que el navegador no muestre la foto vieja
    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;

    const { error: dbErr } = await sb.from('profiles').update({ avatar_url: url }).eq('id', id);
    if (dbErr) throw dbErr;

    state.user.avatarUrl = url;
  } catch (err) {
    throw new Error(friendly(err));
  }
}
