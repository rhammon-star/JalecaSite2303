import { GraphQLClient } from 'graphql-request'

const endpoint = process.env.NEXT_PUBLIC_WOOCOMMERCE_GRAPHQL_URL!

export const graphqlClient = new GraphQLClient(endpoint)

export const GET_PRODUCTS = `
  query GetProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
          image {
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
          variations {
            nodes {
              id
              name
              stockStatus
              price
              regularPrice
              salePrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`

export const SEARCH_PRODUCTS = `
  query SearchProducts($search: String!, $first: Int) {
    products(first: $first, where: { search: $search }) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

export const GET_RELATED_PRODUCTS = `
  query GetRelatedProducts($categorySlug: String!, $first: Int, $excludeId: ID) {
    products(
      first: $first
      where: { category: $categorySlug }
    ) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          image {
            sourceUrl
            altText
          }
          variations {
            nodes {
              id
              name
              stockStatus
              price
              regularPrice
              salePrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_SLUG = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      productCategories {
        nodes {
          id
          name
          slug
        }
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        stockStatus
        sku
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
        sku
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
        attributes {
          nodes {
            name
            options
            ... on GlobalProductAttribute {
              terms { nodes { slug name } }
            }
          }
        }
        variations {
          nodes {
            id
            databaseId
            name
            stockStatus
            price
            regularPrice
            salePrice
            sku
            image {
              sourceUrl
              altText
            }
            attributes {
              nodes {
                name
                value
                label
              }
            }
          }
        }
      }
    }
  }
`
