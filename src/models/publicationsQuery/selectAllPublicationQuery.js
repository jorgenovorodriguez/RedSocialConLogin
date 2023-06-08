const getDB = require('../../db/getDB');
const { generateError } = require('../../services/errors');

const selectAllPublicationQuery = async (
  keyword = '',
  date = '',
  userId = 0
) => {
  let connection;

  try {
    connection = await getDB();

    //Revisar con detenimiento este punto, por si influye en el funcionamiento de la función
    date = date.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [publications] = await connection.query(
      `
        SELECT
          P.id,
          P.title,
          P.place,
          P.description,
          U.username,
          P.userId,
          P.photoName,
          P.userId = ? AS owner,                 
          P.createdAt,
          COUNT(L.id) AS likes,
          BIT_OR(L.userId = ?) AS likedByMe
        FROM publications P
        INNER JOIN users U ON U.id = P.userId
        LEFT JOIN likes L ON P.id = L.publicationId
        WHERE P.title LIKE ? OR P.place LIKE ? OR P.description LIKE ?
        GROUP BY P.id
        ORDER BY P.createdAt ${date}
      `,
      [userId, userId, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );

    // Si no hay publicaciones lanzamos un error.
    if (publications.length < 1) {
      generateError('No hay resultados', 404);
    }

    return publications;
  } finally {
    if (connection) connection.release();
  }
};
module.exports = selectAllPublicationQuery;