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
            name
            stockStatus
            price
            regularPrice
            salePrice
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
