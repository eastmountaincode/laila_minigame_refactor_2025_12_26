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
        url
      },
      alt
    }
  }
`);

export const CHOICE_BUTTONS_QUERY = defineQuery(/* groq */ `
  *[_type == "choiceButton"] | order(label asc) {
    _id,
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
`);
