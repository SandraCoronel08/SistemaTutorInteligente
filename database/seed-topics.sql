-- seed-topics.sql
-- Tutor Inteligente AED I - Initial academic topics and materials
-- Execute this file after database/schema.sql and database/rls-policies.sql.

insert into public.knowledge_topics (unit, topic, subtopic, difficulty, description, keywords)
values
  (
    'Unidad 1',
    'Fundamentos de algoritmos',
    'Concepto de algoritmo',
    'basico',
    'Introduccion al concepto de algoritmo como secuencia finita, ordenada y precisa de pasos para resolver un problema.',
    array['algoritmo', 'entrada', 'proceso', 'salida', 'pseudocodigo']
  ),
  (
    'Unidad 1',
    'Estructuras de control',
    'Secuenciales, condicionales e iterativas',
    'basico',
    'Uso de instrucciones secuenciales, decisiones y ciclos para construir soluciones algoritmicas.',
    array['secuencia', 'condicional', 'if', 'while', 'for', 'iteracion']
  ),
  (
    'Unidad 2',
    'Complejidad algoritmica',
    'Notacion Big O',
    'intermedio',
    'Analisis basico del crecimiento temporal y espacial de un algoritmo usando notacion asintotica.',
    array['complejidad', 'big o', 'tiempo', 'espacio', 'eficiencia']
  ),
  (
    'Unidad 3',
    'Arreglos',
    'Operaciones basicas',
    'basico',
    'Estructura de datos lineal de tamano fijo para almacenar elementos accesibles mediante indices.',
    array['arreglo', 'array', 'indice', 'recorrido', 'insercion']
  ),
  (
    'Unidad 3',
    'Listas',
    'Listas enlazadas',
    'intermedio',
    'Estructura de datos lineal compuesta por nodos enlazados que permite inserciones y eliminaciones dinamicas.',
    array['lista', 'nodo', 'enlace', 'puntero', 'lista enlazada']
  ),
  (
    'Unidad 3',
    'Pilas',
    'Modelo LIFO',
    'basico',
    'Estructura lineal donde el ultimo elemento en entrar es el primero en salir.',
    array['pila', 'stack', 'lifo', 'push', 'pop', 'tope']
  ),
  (
    'Unidad 3',
    'Colas',
    'Modelo FIFO',
    'basico',
    'Estructura lineal donde el primer elemento en entrar es el primero en salir.',
    array['cola', 'queue', 'fifo', 'enqueue', 'dequeue', 'frente']
  ),
  (
    'Unidad 4',
    'Busqueda secuencial',
    'Busqueda lineal',
    'basico',
    'Algoritmo de busqueda que revisa los elementos uno por uno hasta encontrar el valor buscado o terminar el recorrido.',
    array['busqueda secuencial', 'busqueda lineal', 'recorrido', 'comparacion']
  ),
  (
    'Unidad 4',
    'Busqueda binaria',
    'Division del espacio de busqueda',
    'intermedio',
    'Algoritmo eficiente de busqueda sobre datos ordenados que divide repetidamente el intervalo de busqueda.',
    array['busqueda binaria', 'ordenado', 'mitad', 'logaritmico', 'big o']
  ),
  (
    'Unidad 5',
    'Ordenamiento burbuja',
    'Comparacion e intercambio',
    'basico',
    'Algoritmo de ordenamiento simple basado en comparar elementos adyacentes e intercambiarlos cuando corresponda.',
    array['burbuja', 'bubble sort', 'ordenamiento', 'intercambio']
  ),
  (
    'Unidad 5',
    'Ordenamiento por seleccion',
    'Seleccion del minimo',
    'basico',
    'Algoritmo que selecciona repetidamente el menor elemento restante y lo ubica en su posicion final.',
    array['seleccion', 'selection sort', 'minimo', 'ordenamiento']
  ),
  (
    'Unidad 5',
    'Ordenamiento por insercion',
    'Insercion ordenada',
    'intermedio',
    'Algoritmo que construye una porcion ordenada insertando cada nuevo elemento en la posicion que corresponde.',
    array['insercion', 'insertion sort', 'ordenamiento', 'posicion']
  ),
  (
    'Unidad 6',
    'Recursividad',
    'Caso base y caso recursivo',
    'intermedio',
    'Tecnica donde una funcion se invoca a si misma para resolver un problema dividiendolo en subproblemas mas pequenos.',
    array['recursividad', 'caso base', 'caso recursivo', 'funcion']
  ),
  (
    'Unidad 7',
    'Arboles binarios',
    'Recorridos',
    'intermedio',
    'Estructura jerarquica donde cada nodo puede tener hasta dos hijos, con recorridos inorden, preorden y postorden.',
    array['arbol binario', 'nodo', 'raiz', 'inorden', 'preorden', 'postorden']
  ),
  (
    'Unidad 7',
    'Arboles binarios de busqueda',
    'Insercion, busqueda y recorrido',
    'avanzado',
    'Arbol binario que mantiene una propiedad de orden para facilitar operaciones de busqueda, insercion y recorrido.',
    array['bst', 'arbol binario de busqueda', 'insercion', 'busqueda', 'recorrido']
  )
on conflict (unit, topic, subtopic) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Resumen: concepto de algoritmo',
  'Un algoritmo es una secuencia finita y ordenada de pasos que permite resolver un problema. Normalmente se analiza identificando entrada, proceso y salida. En Algoritmos y Estructuras de Datos I se recomienda expresar soluciones en lenguaje natural, pseudocodigo o diagramas simples antes de programar.',
  'Material base del prototipo Tutor Inteligente AED I',
  'teoria',
  'basico'
from public.knowledge_topics kt
where kt.topic = 'Fundamentos de algoritmos'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Ejemplo: estructura condicional',
  'Para decidir si un numero es par, se puede evaluar el resto de dividirlo por 2. Si el resto es 0, el numero es par; en caso contrario, es impar. Este ejemplo usa entrada, decision y salida.',
  'Material base del prototipo Tutor Inteligente AED I',
  'ejemplo',
  'basico'
from public.knowledge_topics kt
where kt.topic = 'Estructuras de control'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Resumen: Big O',
  'La notacion Big O describe como crece el costo de un algoritmo a medida que aumenta el tamano de la entrada. Por ejemplo, un recorrido simple de un arreglo suele tener complejidad temporal O(n), mientras que una busqueda binaria sobre datos ordenados tiene complejidad O(log n).',
  'Material base del prototipo Tutor Inteligente AED I',
  'teoria',
  'intermedio'
from public.knowledge_topics kt
where kt.topic = 'Complejidad algoritmica'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Ejercicio inicial: pilas',
  'Dada una pila inicialmente vacia, realizar las operaciones push(4), push(7), pop(), push(2). Indicar cual es el elemento en el tope al finalizar y explicar el criterio LIFO aplicado.',
  'Material base del prototipo Tutor Inteligente AED I',
  'ejercicio',
  'basico'
from public.knowledge_topics kt
where kt.topic = 'Pilas'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Ejercicio inicial: colas',
  'Dada una cola vacia, realizar enqueue(A), enqueue(B), dequeue(), enqueue(C). Indicar que elemento queda al frente y explicar el criterio FIFO aplicado.',
  'Material base del prototipo Tutor Inteligente AED I',
  'ejercicio',
  'basico'
from public.knowledge_topics kt
where kt.topic = 'Colas'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Ejemplo: busqueda binaria',
  'Para buscar el valor 18 en el arreglo ordenado [3, 8, 12, 18, 25, 31], se compara primero con el elemento central. Segun si el valor buscado es menor o mayor, se descarta una mitad del arreglo y se continua con la otra.',
  'Material base del prototipo Tutor Inteligente AED I',
  'ejemplo',
  'intermedio'
from public.knowledge_topics kt
where kt.topic = 'Busqueda binaria'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Resumen: recursividad',
  'Una solucion recursiva debe definir al menos un caso base, que detiene las llamadas, y un caso recursivo, que reduce el problema hacia una version mas simple. Sin caso base correcto, la recursion puede no terminar.',
  'Material base del prototipo Tutor Inteligente AED I',
  'teoria',
  'intermedio'
from public.knowledge_topics kt
where kt.topic = 'Recursividad'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Guia breve: recorridos de arboles',
  'En preorden se visita raiz, subarbol izquierdo y subarbol derecho. En inorden se visita subarbol izquierdo, raiz y subarbol derecho. En postorden se visita subarbol izquierdo, subarbol derecho y raiz.',
  'Material base del prototipo Tutor Inteligente AED I',
  'guia',
  'intermedio'
from public.knowledge_topics kt
where kt.topic = 'Arboles binarios'
limit 1
on conflict (topic_id, title) do nothing;

insert into public.academic_materials (topic_id, title, content, source, type, difficulty)
select
  kt.id,
  'Resumen: arbol binario de busqueda',
  'En un arbol binario de busqueda, los valores menores que un nodo se ubican en su subarbol izquierdo y los mayores en su subarbol derecho. Esta propiedad permite realizar busquedas guiadas por comparaciones.',
  'Material base del prototipo Tutor Inteligente AED I',
  'teoria',
  'avanzado'
from public.knowledge_topics kt
where kt.topic = 'Arboles binarios de busqueda'
limit 1
on conflict (topic_id, title) do nothing;
