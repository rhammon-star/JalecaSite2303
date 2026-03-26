# Guia de Cadastro de Produtos — Jaleca

Este documento define o padrão de cadastro de produtos no WooCommerce para que tudo apareça corretamente no site.

---

## 1. Tipo de Produto

Sempre selecione o tipo correto em **Dados do produto**:

| Situação | Tipo |
|---|---|
| Produto sem variações (cor/tamanho único) | **Produto simples** |
| Produto com cores e/ou tamanhos diferentes | **Produto variável** |

---

## 2. Imagens

### Imagem principal
- Fundo **branco**
- Produto centralizado
- Resolução mínima: **800 x 800 px**
- Formato: JPG ou PNG
- Tamanho máximo: **300 KB** (comprimir em squoosh.app)

### Galeria do produto
- Fotos adicionais com fundo branco
- Pode incluir detalhes (bolso, punho, botão, etiqueta)
- Mínimo recomendado: **3 fotos**

### Galeria por variação (cor)
- Quando o produto tem diferentes cores, cada variação deve ter sua própria galeria
- As fotos devem mostrar o jaleco na cor específica daquela variação
- Cadastrar dentro da variação em **"Galeria de imagens de variação"**

---

## 3. Informações Básicas

| Campo | Instrução |
|---|---|
| **Nome** | Nome completo do produto. Não incluir "- Jaleca" no final (o site remove automaticamente) |
| **SKU** | Código único por variação. Ex: `003386` |
| **Descrição** | Descrição completa com características, material, recomendações |
| **Descrição curta** | 1 a 3 linhas resumindo o produto. Aparece logo abaixo do preço |
| **Categorias** | Selecionar a categoria correta (Jalecos, Scrubs, etc.) |

---

## 4. Produto Simples — Preços

Na aba **Geral**:

- **Preço regular (R$)** → preço normal de venda
- **Preço promocional (R$)** → preço com desconto (deixar em branco se não houver promoção)

Quando o preço promocional está preenchido, o site exibe o preço normal riscado e o preço promocional em destaque.

---

## 5. Produto Variável — Atributos

Na aba **Atributos**, adicionar os atributos que o produto possui.

### ⚠️ Regra importante — Nomes de atributos

O site reconhece automaticamente os atributos pelos nomes abaixo. Use exatamente esses nomes:

| Atributo | Nome a usar no WooCommerce |
|---|---|
| Tamanho | `Tamanho` |
| Cor | `Cor` |
| Estampa / Modelo visual | `Estampas` |

> **Atenção:** Não usar nomes como "Grade", "Modelo", "Versão" — o site não reconhecerá como tamanho ou cor e as seleções não funcionarão.

### Configuração dos atributos

Após adicionar o atributo:
- ✅ Marcar **"Visível na página de produto"**
- ✅ Marcar **"Usado para variações"**
- Adicionar todos os valores (PP, P, M, G, GG / Azul, Branco, etc.)
- Clicar em **"Salvar atributos"**

---

## 6. Produto Variável — Variações

Na aba **Variações**:

1. Clique em **"Gerar variações"** → confirme para criar todas as combinações
2. Expanda cada variação para preencher:

| Campo | Instrução |
|---|---|
| **Ativo** | Marcar ✅ |
| **Imagem da variação** | Foto principal para essa cor/estampa |
| **Galeria de imagens de variação** | Fotos adicionais dessa cor/estampa |
| **SKU** | Código único para essa variação |
| **Preço (R$)** | Preço normal dessa variação |
| **Preço promocional (R$)** | Preço com desconto (deixar em branco se não houver) |
| **Quantidade em estoque** | Quantidade disponível |
| **Gerenciar estoque?** | Marcar ✅ para controle automático |

### Exemplo de variação com desconto

```
Variação: Azul Céu + PP
  Preço: R$ 220,00
  Preço promocional: R$ 110,00   ← aparece com 50% OFF no site
```

```
Variação: Branco + PP
  Preço: R$ 220,00
  Preço promocional: (vazio)     ← sem desconto, aparece preço normal
```

---

## 7. Estoque

| Campo | Instrução |
|---|---|
| **Gerenciar estoque?** | Marcar ✅ em cada variação |
| **Quantidade** | Quantidade disponível por variação |
| **Permitir encomendas?** | "Não permitir" como padrão |
| **Limiar de estoque baixo** | Deixar no padrão da loja (2 unidades) |

Quando o estoque de uma variação chega a zero, o site exibe automaticamente **"Esgotado"** para aquela combinação.

---

## 8. Entrega (Peso e Dimensões)

Preencher em cada variação para o cálculo de frete ser preciso:

| Campo | Exemplo |
|---|---|
| **Peso (kg)** | `0,600` |
| **Comprimento (cm)** | `20` |
| **Largura (cm)** | `16` |
| **Altura (cm)** | `6` |

> Esses valores são usados pela integração com o **Melhor Envio** para calcular o frete real.

---

## 9. SEO (Yoast)

| Campo | Instrução |
|---|---|
| **Título SEO** | Ex: `Jaleco Feminino Azul Botão - Jaleca` |
| **Meta descrição** | 1 frase descritiva com palavras-chave. Ex: `Jaleco feminino azul de botão, ideal para médicas e enfermeiras. Compre na Jaleca.` |
| **Palavra-chave foco** | Principal termo de busca. Ex: `jaleco feminino azul` |

---

## 10. Checklist antes de publicar

- [ ] Nome do produto preenchido
- [ ] Imagem principal (fundo branco, mín. 800x800)
- [ ] Mínimo 3 fotos na galeria
- [ ] Categoria selecionada
- [ ] Descrição completa preenchida
- [ ] Descrição curta preenchida
- [ ] Atributos nomeados corretamente (`Cor`, `Tamanho` ou `Estampas`)
- [ ] Atributos marcados como "Visível" e "Usado para variações"
- [ ] Variações geradas com preço em cada uma
- [ ] Estoque configurado por variação
- [ ] Peso e dimensões preenchidos por variação
- [ ] Imagem por variação (ao menos a principal por cor)
- [ ] SEO preenchido (título + meta descrição)
- [ ] Status: **Publicado**

---

## 11. Erros comuns a evitar

| Erro | Consequência | Como evitar |
|---|---|---|
| Nomear atributo como "Grade" ou "Modelo" | Seletor de tamanho não aparece no site | Usar sempre "Tamanho" |
| Deixar preço vazio na variação | Variação não aparece no site | Preencher preço em todas as variações |
| Não marcar "Usado para variações" | Variações não são geradas | Sempre marcar ao criar atributo |
| Imagem sem fundo branco na principal | Visual inconsistente na loja | Usar fundo branco na foto principal |
| Peso/dimensões zerados | Frete calculado incorretamente | Preencher em todas as variações |

---

*Documento gerado em março de 2026 — Jaleca Jalecos e Mimos*
