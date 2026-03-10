const Database = require('better-sqlite3');
const db = new Database('school_portal.db');

db.exec(`
  DELETE FROM news;
  DELETE FROM events;
  
  INSERT INTO news (title, content, date, image_url) VALUES 
  ('ABC: Professora de São Bernardo do Campo cria aula para empoderar alunas contra violência financeira', 'À frente das aulas de matemática e educação financeira da EE Diplomata Sérgio Vieira de Mello, Daniela dos Santos propôs a criação de uma turma exclusiva com alunas mulheres', '2026-03-08T19:00:00.000Z', 'https://images.unsplash.com/photo-1577896851231-70ef18dce14a?auto=format&fit=crop&q=80'),
  ('Estudantes da rede estadual criam site de denúncias de violência contra a mulher que simula portal de delivery de comida', 'Protótipo foi desenvolvido por alunos em plataforma de programação disponível gratuitamente para o Ensino Fundamental e Ensino Médio', '2026-03-08T18:00:00.000Z', 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80'),
  ('Vagas de estágio do BEEM: Educação SP está com inscrições abertas para estudantes do Ensino Médio', 'Há opções para alunos dos itinerário formativos de exatas, humanas e técnico profissional; bolsas chegam a R$ 883,66 mensais', '2026-03-08T17:00:00.000Z', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80');

  INSERT INTO events (title, description, date) VALUES
  ('Feira de Ciências', 'Apresentação dos projetos dos alunos do Ensino Médio.', '2026-04-15'),
  ('Reunião de Pais e Mestres', 'Encontro bimestral para acompanhamento pedagógico.', '2026-04-20');
`);
console.log('Seeded DB');
