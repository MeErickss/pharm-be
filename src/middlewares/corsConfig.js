import cors from 'cors';

const corsOptions = {
  origin: '*', // Permite acesso de qualquer origem. Você pode restringir a domínios específicos.
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Cabeçalhos permitidos
};

export default cors(corsOptions);
