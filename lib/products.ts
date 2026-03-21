const product1 = "/product-1.jpg";
const product2 = "/product-2.jpg";
const product3 = "/product-3.jpg";
const product4 = "/product-4.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  gender: "Feminino" | "Masculino";
  colors: string[];
  sizes: string[];
  image: string;
  tag?: string;
  description: string;
  details: string[];
}

export const products: Product[] = [
  {
    id: "jaleco-classico-branco",
    name: "Jaleco Clássico Slim",
    price: 289,
    originalPrice: 349,
    category: "Jalecos",
    gender: "Feminino",
    colors: ["Branco", "Cinza Claro"],
    sizes: ["PP", "P", "M", "G", "GG"],
    image: product1,
    tag: "Mais Vendido",
    description: "Corte slim moderno em tecido premium com elastano. Bolsos funcionais e acabamento impecável para o profissional que valoriza estilo e conforto.",
    details: [
      "Modelagem slim com linha editorial e estrutura refinada.",
      "Tecido premium com elastano para conforto ao longo do plantão.",
      "Bolsos funcionais e acabamento limpo para uso diário.",
    ],
  },
  {
    id: "scrub-verde-floresta",
    name: "Scrub Essencial Verde",
    price: 199,
    category: "Scrubs",
    gender: "Feminino",
    colors: ["Verde Floresta", "Azul Marinho", "Preto"],
    sizes: ["PP", "P", "M", "G", "GG", "XGG"],
    image: product2,
    description: "Tecido anti-microbiano com stretch 4-way. Decote V clássico com caimento perfeito. Ideal para longas jornadas.",
    details: [
      "Tecido anti-microbiano com toque macio e visual elegante.",
      "Elasticidade 4-way para mobilidade total durante a rotina clínica.",
      "Decote V clássico com caimento preciso e confortável.",
    ],
  },
  {
    id: "scrub-cinza-premium",
    name: "Scrub Premium Cinza",
    price: 219,
    category: "Scrubs",
    gender: "Feminino",
    colors: ["Cinza", "Rosa Antigo", "Verde Menta"],
    sizes: ["PP", "P", "M", "G", "GG"],
    image: product3,
    tag: "Novo",
    description: "Linha premium com cintura ajustável e bolsos com zíper. Tecido wrinkle-free que mantém a elegância durante todo o plantão.",
    details: [
      "Cintura ajustável para um ajuste mais sofisticado ao corpo.",
      "Bolsos com zíper discretos e funcionais.",
      "Tecido wrinkle-free que mantém aparência impecável por horas.",
    ],
  },
  {
    id: "scrub-azul-marinho",
    name: "Scrub Performance Azul",
    price: 239,
    originalPrice: 279,
    category: "Scrubs",
    gender: "Masculino",
    colors: ["Azul Marinho", "Preto", "Carvão"],
    sizes: ["P", "M", "G", "GG", "XGG"],
    image: product4,
    description: "Tecnologia moisture-wicking para máximo conforto. Corte atlético com mobilidade total. O favorito dos cirurgiões.",
    details: [
      "Tecnologia moisture-wicking para sensação de frescor contínuo.",
      "Corte atlético com visual clean e acabamento premium.",
      "Desenvolvido para acompanhar movimentos com leveza e precisão.",
    ],
  },
];

export const categories = ["Todos", "Jalecos", "Scrubs", "Calças", "Acessórios"];
export const genderOptions = ["Todos", "Feminino", "Masculino"] as const;
export const colorOptions = ["Branco", "Preto", "Verde Floresta", "Azul Marinho", "Cinza", "Rosa Antigo"];
export const sizeOptions = ["PP", "P", "M", "G", "GG", "XGG"];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "como-escolher-jaleco",
    title: "Como Escolher o Jaleco Ideal Para Sua Especialidade",
    excerpt: "Cada profissão da saúde tem necessidades específicas. Descubra qual modelo se adapta melhor à sua rotina.",
    date: "12 Mar 2026",
    readTime: "5 min",
    category: "Guias",
  },
  {
    id: "tendencias-scrubs-2026",
    title: "Tendências em Scrubs Para 2026: Conforto e Estilo",
    excerpt: "O mercado de uniformes médicos está em transformação. Veja o que está em alta e como se manter elegante.",
    date: "28 Fev 2026",
    readTime: "4 min",
    category: "Tendências",
  },
  {
    id: "cuidados-tecidos-medicos",
    title: "Guia de Cuidados: Como Manter Seus Jalecos Impecáveis",
    excerpt: "Dicas práticas de lavagem, armazenamento e conservação para prolongar a vida útil dos seus uniformes.",
    date: "15 Fev 2026",
    readTime: "3 min",
    category: "Cuidados",
  },
  {
    id: "sustentabilidade-moda-medica",
    title: "Sustentabilidade na Moda Médica: O Futuro é Agora",
    excerpt: "Conheça os tecidos e processos sustentáveis que estão revolucionando a indústria de uniformes.",
    date: "2 Fev 2026",
    readTime: "6 min",
    category: "Sustentabilidade",
  },
];
