-- Crear la tabla de videos
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los videos del curso
INSERT INTO videos (youtube_id, title, keywords, description) VALUES
  ('uJUabGdZPrA', 'Herida profunda', 
   ARRAY['herida profunda', 'sangrado grave', 'corte profundo', 'hemorragia'],
   'Procedimiento para atender una herida profunda y controlar el sangrado'),

  ('R3ONos9wjeo', 'Heimlich en adultos',
   ARRAY['heimlich', 'asfixia', 'atragantamiento', 'ahogo', 'maniobra'],
   'Cómo realizar la maniobra de Heimlich en adultos para casos de atragantamiento'),

  ('99BWpzfREfo', 'Quemadura tercer grado',
   ARRAY['quemadura grave', 'quemadura tercer grado', 'quemadura seria', 'quemaduras'],
   'Tratamiento y manejo de quemaduras de tercer grado'),

  ('oD3Q9a4g1XQ', 'Quemadura química',
   ARRAY['quemadura química', 'químicos', 'ácido', 'sustancias corrosivas'],
   'Manejo y primeros auxilios para quemaduras químicas'),

  ('60xnnr_4S0Y', 'Mordedura de animales domésticos',
   ARRAY['mordedura', 'perro', 'gato', 'animal doméstico', 'mascota'],
   'Qué hacer en caso de mordedura de animales domésticos'),

  ('JM2a1PHPs5g', 'Mordedura de animales salvajes',
   ARRAY['mordedura salvaje', 'serpiente', 'animal silvestre', 'ponzoña'],
   'Procedimiento ante mordeduras de animales salvajes'),

  ('CZDG0KvhVH0', 'Manejo de una convulsión',
   ARRAY['convulsión', 'ataque epiléptico', 'epilepsia', 'crisis convulsiva'],
   'Cómo actuar ante una persona que sufre una convulsión'),

  ('1ldePkDbvl8', 'Corte superficial',
   ARRAY['corte leve', 'herida superficial', 'rasguño', 'cortada menor'],
   'Tratamiento de cortes y heridas superficiales'),

  ('o7fkN20kM5o', 'Fractura abierta',
   ARRAY['Ruptura del hueso', 'Tipos de fracturas', 'Fractura abierta', 'Síntomas'],
   'Manejo de fracturas abiertas'),

  ('lClViXE-6CM', 'Fractura cerrada',
   ARRAY['Hueso roto sin rasgar la piel', 'Deformidad clara', 'Hinchazón', 'Inmovilizar la zona afectada'],
   'Tratamiento de fracturas cerradas'),

  ('4jsD9Lrju0g', 'Heimlich en niños y lactantes',
   ARRAY['Colocar al bebé boca abajo', 'Apoyar en el antebrazo', 'Cabeza en la mano del adulto', 'Dar 5 golpes enérgicos en la espalda'],
   'Cómo realizar la maniobra de Heimlich en niños y lactantes'),

  ('PxoGxnfBavA', 'Atención de esguinces',
   ARRAY['esguince', 'torcedura', 'lesión articular', 'ligamentos'],
   'Cómo atender un esguince'),

  ('4Qi7KOqzwbQ', 'Hemorragia nasal',
   ARRAY['sangrado nasal', 'epistaxis', 'hemorragia nariz', 'sangrado'],
   'Manejo de hemorragias nasales'),

  ('LRks0by0zRg', 'Hemorragia interna',
   ARRAY['Causadas por golpes o caídas', 'Áreas oscuras y decoloradas de la piel', 'hinchazón', 'Movilizar al paciente'],
   'Tratamiento de hemorragias internas'),

  ('Dw1my_ypHBY', 'Intoxicación por agroquímicos',
   ARRAY['intoxicación', 'Ingerir', 'fertilizantes', 'sustancias dañinas'],
   'Primeros auxilios en casos de intoxicación por agroquímicos'),

  ('Ee-eSxR7lPo', 'Intoxicación por alimentos',
   ARRAY['Alimentos o bebidas en mal estado', 'vómito', 'diarrea', 'dolor estomacal'],
   'Manejo de intoxicaciones alimentarias'),

  ('LMoPH26C67E', 'Luxación',
   ARRAY['Desplazamiento de un hueso', 'Causada por un golpe o impacto', 'inflamación', 'deformidad'],
   'Tratamiento de luxaciones'),

  ('UO6TG-4ZHUs', 'Picadura de araña',
   ARRAY['Puntos rojos en el área afectada', 'Dolor intenso las primeras 2 horas', 'Calambres en el miembro afectado', 'Rigidez abdominal'],
   'Qué hacer en caso de picadura de araña'),

  ('4yk7I1HHT-w', 'Picadura de alacrán',
   ARRAY['nflamación en la zona', 'Necrosis', 'Aplicar compresas frías', 'Inflamación en la zona de la picadura'],
   'Manejo de picaduras de alacrán'),

  ('N0lznRQ4dG0', 'Picadura de avispas, abejas y hormigas',
   ARRAY['reacción alérgica ', 'ampolla blanca', 'enrojecimiento', 'picazón'],
   'Tratamiento de picaduras de avispas, abejas y hormigas'),

  ('e1oJTRYBQSU', 'Quemadura de primer grado',
   ARRAY['Enrojecimiento de la piel', 'epidermis', 'Dolor intenso', 'Sin dejar secuelas '],
   'Manejo de quemaduras de primer grado'),

  ('HwhJ_iwMaMo', 'Armado del botiquín',
   ARRAY['botiquín', 'implementos', 'materiales', 'primeros auxilios'],
   'Cómo armar un botiquín completo de primeros auxilios'),

  ('MMak-aKjyPE', 'Quemadura de segundo grado',
   ARRAY['Destruye la epidermis y parte de la dermis', 'Dolor intenso', 'inflamación'],
   'Tratamiento de quemaduras de segundo grado');

-- Crear índice para búsqueda de texto
CREATE INDEX videos_keywords_idx ON videos USING GIN (keywords);

-- Política de seguridad para permitir lectura pública
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de videos" ON videos
  FOR SELECT USING (true);

