import { defineQuery } from "next-sanity";

export const HOMEPAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homepage"][0] {
    backgroundMediaType,
    backgroundVideo {
      asset->{
        _id,
        url
      }
    },
    backgroundImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt,
      hotspot,
      crop
    },
    choiceButtons[] {
      _key,
      label,
      href,
      defaultImage {
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions { width, height }
          }
        },
        alt,
        hotspot,
        crop
      },
      hoverImage {
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions { width, height }
          }
        },
        alt,
        hotspot,
        crop
      }
    }
  }
`);
