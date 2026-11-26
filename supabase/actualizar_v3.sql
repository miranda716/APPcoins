-- ============================================================
--  EcoPuntos Unicórdoba · ACTUALIZACIÓN v3
--  Ejecútalo DESPUÉS de actualizar_v2.sql (SQL Editor → New query → Run).
--
--  Solo AGREGA una columna. No borra nada: no usa DROP, TRUNCATE ni DELETE.
--  Se puede ejecutar varias veces sin problema.
-- ============================================================

-- Qué materiales se reclamaron en cada reciclaje (ej. {Plástico,Vidrio}).
-- Se usa para la espera de 30 minutos por material, aunque cambies de celular o recargues.
alter table public.movimientos
  add column if not exists materiales text[];
