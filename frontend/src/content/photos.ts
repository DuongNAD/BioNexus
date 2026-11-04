// src/content/photos.ts — Kho ảnh thật & metadata bản quyền Wikimedia Commons (tạo tự động bởi scripts/build-real-photos.mjs)

export interface PhotoSourceItem {
  readonly src: string;
  readonly width: number;
}

export interface PhotoCredit {
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly sourceUrl: string;
  readonly modified?: boolean;
}

export interface PhotoMetadata {
  readonly id: string;
  readonly title: string;
  readonly scientificName?: string;
  readonly region?: string;
  readonly role: 'hero' | 'portrait' | 'gallery' | 'habitat' | 'product' | 'biome';
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly focus: string;
  readonly alt: string;
  readonly sources: {
    readonly avif: readonly PhotoSourceItem[];
    readonly webp: readonly PhotoSourceItem[];
    readonly jpg: string;
  };
  readonly placeholder: string;
  readonly credit: PhotoCredit;
}

export const PHOTOS: Record<string, PhotoMetadata> = {
  "axolotl/hero-1": {
    "id": "axolotl/hero-1",
    "title": "Kỳ giông Axolotl màu tự nhiên (Aquarium Finisterrae)",
    "scientificName": "Ambystoma mexicanum",
    "role": "hero",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "52% 48%",
    "alt": "Kỳ giông Axolotl màu xám xanh đốm đen tự nhiên với ba cặp mang ngoài dạng lông vũ đang nằm trên nền sỏi dưới nước.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/hero-480.avif",
          "width": 480
        },
        {
          "src": "photos/axolotl/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/axolotl/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/hero-480.webp",
          "width": 480
        },
        {
          "src": "photos/axolotl/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/axolotl/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/axolotl/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJQBOgCDcWmrOBAAA/trTJL39AtClz6p8WkihXu8QaTTbNqHHhADzuAGOxSLeYDXZ2BHB9B3W4jW6lTwp7qAAr4elnUEfkRFBEY/gAAA=",
    "credit": {
      "author": "Fernando Losada Rodríguez",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum.005_-_Aquarium_Finisterrae.jpg"
    }
  },
  "axolotl/portrait-1": {
    "id": "axolotl/portrait-1",
    "title": "Chân dung cận cảnh đầu và mang ngoài Kỳ giông Axolotl",
    "scientificName": "Ambystoma mexicanum",
    "role": "portrait",
    "width": 960,
    "height": 659,
    "aspectRatio": 1.46,
    "focus": "50% 45%",
    "alt": "Cận cảnh phần đầu rộng và chùm mang ngoài xòe như lông vũ của kỳ giông Axolotl màu nâu đốm tự nhiên.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/axolotl/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/axolotl/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/axolotl/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAwAA8BgJbACdAD2OnuZOu6AAP70eE6ezjmN3sFSZfODTwa6oO7E8wr4qo7PSCMiZhD095fXqZaQkjgycG5RG5n3/6UBQyiSKM0Sznc9gAAA",
    "credit": {
      "author": "Stan Shebs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_3.jpg"
    }
  },
  "axolotl/habitat-1": {
    "id": "axolotl/habitat-1",
    "title": "Kênh đào sinh thái hồ Xochimilco, Mexico City",
    "scientificName": "Ambystoma mexicanum",
    "region": "Hồ Xochimilco, Mexico",
    "role": "habitat",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 55%",
    "alt": "Những chiếc thuyền gỗ truyền thống đầy màu sắc trên kênh đào hồ Xochimilco tại Mexico City — nơi cư ngụ tự nhiên của kỳ giông Axolotl.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/habitat-960.avif",
          "width": 960
        },
        {
          "src": "photos/axolotl/habitat-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/habitat-960.webp",
          "width": 960
        },
        {
          "src": "photos/axolotl/habitat-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/axolotl/habitat-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJZQCdADbYFRY+gAA/rxYljdyq4DHR9eXzarxsNgiErvG3dD6y9xjIiWGaLjcc5LRY2IwTuIVvSC5rB/DEVRiV/LPL0sQ6IYz7ZEAAAA=",
    "credit": {
      "author": "El Comandante",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Trajineras_(Xochimilco,_2009).JPG"
    }
  },
  "axolotl/gallery-1": {
    "id": "axolotl/gallery-1",
    "title": "Kỳ giông Axolotl màu nâu đốm tự nhiên trên nền cát",
    "scientificName": "Ambystoma mexicanum",
    "role": "gallery",
    "width": 960,
    "height": 423,
    "aspectRatio": 2.27,
    "focus": "50% 50%",
    "alt": "Cá thể kỳ giông Axolotl màu nâu sẫm đốm hạt tự nhiên đang bò trên nền cát mịn dưới đáy bể.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/axolotl/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAQCdASoQAAwAA8BgJYgCdADaPMlXMAD+ikigz1MmChMIuAOpaNuybiQm8hrwr3vuI7Iqhq6ah0F42+QiOPxOlLibexNVgSOYaWx6BsXNBMAA",
    "credit": {
      "author": "Stan Shebs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_2.jpg"
    }
  },
  "axolotl/gallery-2": {
    "id": "axolotl/gallery-2",
    "title": "Góc nhìn trực diện đầu Kỳ giông Axolotl dưới nước",
    "scientificName": "Ambystoma mexicanum",
    "role": "gallery",
    "width": 960,
    "height": 863,
    "aspectRatio": 1.11,
    "focus": "50% 50%",
    "alt": "Góc chụp trực diện phần đầu dẹp rộng, đôi mắt tròn không mí và mang ngoài tím xám của kỳ giông Axolotl trên nền đá cuội.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/axolotl/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwAgCdASoQAAwAA8BgJbAC7ADHmO93fxH3gAD+9Jg00pI1WwbEaOB5BxPwG+eAJyQD/eWQRJvovJKpMYr4Q+LWIhjMqnKXc8U63bBfq/kHxzJSig2OmAAA",
    "credit": {
      "author": "Stan Shebs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_1.jpg"
    }
  },
  "axolotl/gallery-3": {
    "id": "axolotl/gallery-3",
    "title": "Kỳ giông Axolotl ẩn mình giữa cụm thủy sinh",
    "scientificName": "Ambystoma mexicanum",
    "role": "gallery",
    "width": 960,
    "height": 785,
    "aspectRatio": 1.22,
    "focus": "45% 55%",
    "alt": "Cá thể kỳ giông Axolotl màu nâu đen ẩn mình bên bụi rong thủy sinh trên nền cát vàng.",
    "sources": {
      "avif": [
        {
          "src": "photos/axolotl/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/axolotl/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/axolotl/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/axolotl/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAQAgCdASoQAAwAA8BgJbACdAEe0sALmY0AAPKEvfwezkI+nVMlgWcj8SVNVcTXpTFikfZaTC1MaPuqEyHr+NA1a1NL6rAsjDu5MdRfx3MBwAAA",
    "credit": {
      "author": "FakirNL",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_in_Ouwehands_Dierenpark_01.jpg"
    }
  },
  "nepenthes-rajah/hero-1": {
    "id": "nepenthes-rajah/hero-1",
    "title": "Ấm dưới khổng lồ của Nắp ấm Rajah ngoài tự nhiên",
    "scientificName": "Nepenthes rajah",
    "role": "hero",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "52% 50%",
    "alt": "Bình ấm dưới cỡ lớn màu đỏ tía của loài Nepenthes rajah nằm trên thảm lá khô tại rừng núi Kinabalu, Sabah, Borneo.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/nepenthes-rajah/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/nepenthes-rajah/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/nepenthes-rajah/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAQCdASoQAAwAA8BgJbACdAC4OJzWvGgA/u8fOM15HGqShogZ6WclXQ+WAEK/tOe9hTSwC7qRHdIWoPNdvhPN1gvJTLRi3jjzcKaSnZBkNTRlEE58THbwVLQ517qspuwaUAAA",
    "credit": {
      "author": "NepGrower (người tải lên)",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Large_lower_pitcher_of_wild_Nepenthes_rajah_plant.jpg"
    }
  },
  "nepenthes-rajah/portrait-1": {
    "id": "nepenthes-rajah/portrait-1",
    "title": "Cây Nắp ấm Rajah hoang dã với tán lá lớn và bình ấm đỏ nâu giữa bụi dương xỉ",
    "scientificName": "Nepenthes rajah",
    "role": "portrait",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "55% 65%",
    "alt": "Bụi cây Nepenthes rajah mọc giữa thảm cỏ và dương xỉ rừng núi với các phiến lá xanh dài, tua cuốn xoắn và chiếc bình ấm màu đỏ nâu mở nắp ở góc dưới bên phải.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-rajah/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwAQCdASoQAAwAA8BgJaACdAC3cJhc/0AA+5v2SwzIRIZyqOf6s5youqIrUAIE1vlRvkIYiXS2e2zlV0F3m0yoGuuI4nDVrdg2VE9+rvRLNYABys8HCHrhbXB/U2Z73AA=",
    "credit": {
      "author": "No machine-readable author provided. NepGrower~commonswiki assumed (based on copyright claims).",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nep_rajah6.jpg"
    }
  },
  "nepenthes-rajah/habitat-1": {
    "id": "nepenthes-rajah/habitat-1",
    "title": "Rừng mây sườn núi Kinabalu tại Kundasang, Sabah, Borneo",
    "scientificName": "Nepenthes rajah",
    "region": "Núi Kinabalu, Sabah, Borneo",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Mây mù dày đặc bao phủ tầng tán rừng mưa núi cao trên sườn núi Kinabalu tại Kundasang, Sabah, Malaysia.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-rajah/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADwAQCdASoQAAwAA8BgJQBOgCPZxGxHQAAA/lvtCVcLsRjZddvU9ud+hFHdQn6npV4aQY8Ro//BKwHj5EfTkQRDHjgAAA==",
    "credit": {
      "author": "kallerna",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rainforest_cloud_forming_Kinabalu_Sabah_Borneo_Kampong_Kundasang_5.jpg"
    }
  },
  "nepenthes-rajah/gallery-1": {
    "id": "nepenthes-rajah/gallery-1",
    "title": "Bụi Nắp ấm Rajah tự nhiên tại Mesilau, núi Kinabalu",
    "scientificName": "Nepenthes rajah",
    "role": "gallery",
    "width": 960,
    "height": 639,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cây Nepenthes rajah trưởng thành với phiến lá xanh dày hình khiên và bình ấm đỏ tía tại khu vực Mesilau, núi Kinabalu, Borneo.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-rajah/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJYwAAlyU6YazowAA/uW9NKQFaN8ymLfGSWMQenCli4Y2DNXcsQi8nzQvBEAiLvECC4FC7yN9juFlAAA=",
    "credit": {
      "author": "JeremiahsCPs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kinabalu_Mesilau_N._rajah_upper_pitcher_plant_2.jpg"
    }
  },
  "nepenthes-rajah/gallery-2": {
    "id": "nepenthes-rajah/gallery-2",
    "title": "Bình Nắp ấm Rajah bên vách đá thác nước núi Kinabalu",
    "scientificName": "Nepenthes rajah",
    "role": "gallery",
    "width": 960,
    "height": 639,
    "aspectRatio": 1.5,
    "focus": "65% 55%",
    "alt": "Bình bẫy màu đỏ cam của Nepenthes rajah treo trên vách đá ẩm ướt cạnh dòng thác nhỏ trên núi Kinabalu, Sabah.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-rajah/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAQCdASoQAAwAA8BgJQBdgCDMFx+gAPiutTJZ5Y24t1jSuKX/tH4PTGGgR8sZoprCK4NdxoTdDb55FvMS428os9NsPdVr22Ca4NOlUgAAAA==",
    "credit": {
      "author": "JeremiahsCPs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kinabalu_water_fall_N._rajah_11.JPG"
    }
  },
  "nepenthes-rajah/gallery-3": {
    "id": "nepenthes-rajah/gallery-3",
    "title": "Tán lá hình khiên của quần thể Nắp ấm Rajah trên núi Kinabalu",
    "scientificName": "Nepenthes rajah",
    "role": "gallery",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cụm cây Nepenthes rajah mọc giữa thảm cỏ và cây bụi ẩm trên sườn núi Kinabalu, lộ rõ gân lá đính hình khiên đặc trưng.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-rajah/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-rajah/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-rajah/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-rajah/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAQAgCdASoQAAwAA8BgJQBOgMXhqMKrnwHgAM4m5IMM13yIHw2PiVmTzmvQtuQP1lJ4gd6g9VLdRj0Ghpr58BK/YDhvpZ5ItoUcJbnI6ucXBDCD0wsAAA==",
    "credit": {
      "author": "NepGrower",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nep_rajah10.jpg"
    }
  },
  "ball-python/hero-1": {
    "id": "ball-python/hero-1",
    "title": "Cận cảnh đầu và cổ Trăn bóng hoang dã (Python regius)",
    "scientificName": "Python regius",
    "role": "hero",
    "width": 1920,
    "height": 1201,
    "aspectRatio": 1.6,
    "focus": "50% 50%",
    "alt": "Cận cảnh phần đầu và cổ của cá thể trăn bóng Python regius màu tự nhiên nâu đen điểm vệt vàng đồng trên nền vỏ cây.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/ball-python/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/ball-python/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/ball-python/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAwAA8BgJaACdAYtVgSXycAA4lC05QCX9uvzCYlhMbNSgUS6T/6x6zSdcx5Mn0K0/cYajKTrRHYnRZhycmJLHG/HcGzAwsUBPvP2gAA=",
    "credit": {
      "author": "Brian Gratwicke",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_-_ball_python.jpg"
    }
  },
  "ball-python/portrait-1": {
    "id": "ball-python/portrait-1",
    "title": "Trăn bóng cuộn mình ẩn nấp giữa lớp vỏ cây khô",
    "scientificName": "Python regius",
    "role": "portrait",
    "width": 960,
    "height": 845,
    "aspectRatio": 1.14,
    "focus": "50% 48%",
    "alt": "Cá thể trăn bóng Python regius cuộn tròn thân mình đặc trưng giữa hai mảnh vỏ cây khô.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/ball-python/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/ball-python/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAQCdASoQAAwAA8BgJYwCdAC8AL2GAAD+wGcXO1NNu7TIIPWr5GIdNJMAEcsXFXOPaRbQxM5ScAAglldewjGp65LSVGQAAAA=",
    "credit": {
      "author": "Rainer Altenkamp",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_070731_a.jpg"
    }
  },
  "ball-python/habitat-1": {
    "id": "ball-python/habitat-1",
    "title": "Cảnh quan thảo nguyên Savan tại miền Bắc Ghana, Tây Phi",
    "scientificName": "Python regius",
    "region": "Thảo nguyên Tây và Trung Phi",
    "role": "habitat",
    "width": 1920,
    "height": 1370,
    "aspectRatio": 1.4,
    "focus": "50% 50%",
    "alt": "Cảnh quan thảo nguyên savan xanh mát điểm cây gỗ thưa và đàn voi châu Phi tại khu vực miền Bắc Ghana, Tây Phi.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACwAQCdASoQAAwAA8BgJbACdAEMcdXAAP7Qy++xxraEPhtpxD4rBKXgRR20NTuav1bfaOqYq8vhFlGci+KbjMIj+TLeDMgA",
    "credit": {
      "author": "Stig Nygaard",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Savanna_landscape,_Northern_region,_Ghana.jpg"
    }
  },
  "ball-python/gallery-1": {
    "id": "ball-python/gallery-1",
    "title": "Cấu trúc vảy môi và hố cảm nhiệt của Trăn bóng",
    "scientificName": "Python regius",
    "role": "gallery",
    "width": 960,
    "height": 686,
    "aspectRatio": 1.4,
    "focus": "55% 50%",
    "alt": "Ảnh chụp cận cảnh phần đầu trăn bóng Python regius cho thấy rõ mắt tròn đen và hàng hố cảm nhiệt dọc hàm trên.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABQAgCdASoQAAwAA8BgJZgCdAYulvJgPpsVzQAA/ulWNxJeRCehqQFPlTIyexIYit1tthWSmCFK2Ldy5SYKX2Gh7Ss1kKAXgr79kDXVK97UqMoAwD2L0Lm4K6GaSOExMdvN2TQvgAA=",
    "credit": {
      "author": "Holger Krisp",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python-regius-kopf-k%C3%B6nigspython.jpg"
    }
  },
  "ball-python/gallery-2": {
    "id": "ball-python/gallery-2",
    "title": "Trăn bóng trưởng thành cuộn tròn trên nền vỏ thông và rêu khô",
    "scientificName": "Python regius",
    "role": "gallery",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể trăn bóng cái trưởng thành (Python regius) màu tự nhiên nâu đen và vàng đồng đang nằm cuộn tròn trên lớp vỏ thông.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAwAgCdASoQAAwAA8BgJZgCdAYtBwm/5jcwAADie8Wksq9JNAu+YQzsF7IfMcGnNefC9Z1Ue846wasaV8xH73Af+qHJrMKKtZOx59m2/XNv5qzbpqoN3yld2sLJdc/y+AAAAA==",
    "credit": {
      "author": "Squamata55",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Female_Ball_python_(Python_regius).jpg"
    }
  },
  "ball-python/gallery-3": {
    "id": "ball-python/gallery-3",
    "title": "Trăn bóng biến thể giảm sắc tố đen (Hypomelanistic)",
    "scientificName": "Python regius",
    "role": "gallery",
    "width": 960,
    "height": 577,
    "aspectRatio": 1.66,
    "focus": "50% 50%",
    "alt": "Cá thể trăn bóng Python regius dòng đột biến Hypomelanistic cuộn thân trên nền trắng với tông màu nâu sáng và vàng kem.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/ball-python/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAABwAgCdASoQAAwAA8BgJYgCdAYvD2a3xy5qW/UwAP7HcIONNKqR5hoHAD1i6bUm8TIC0rcjp6cnnbN9fTa4/Q/bPDlfwGRIo9zhe7HgWlN4xVNZP3uWblxckgSRAWwA",
    "credit": {
      "author": "WingedWolfPsion",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_-_hypomelanistic.png"
    }
  },
  "leopard-gecko/hero-1": {
    "id": "leopard-gecko/hero-1",
    "title": "Thằn lằn da báo hoang dã trên nền cát (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "hero",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "52% 48%",
    "alt": "Cá thể thằn lằn da báo Eublepharis macularius với các dải màu xám nâu sẫm xen kẽ nền kem nhạt và đốm đen sần hạt trên cát.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/leopard-gecko/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/leopard-gecko/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/leopard-gecko/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoQAAwAA8BgJaACdAEP/wy78jkAAP5WpNJHOQOE+rogAuNT4+l0+p1PXnqkRTlGs8oQAjpRZoq9Ly2xSQW6+jiop8rgAA==",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eublepharis_macularius_2009_G6.jpg"
    }
  },
  "leopard-gecko/portrait-1": {
    "id": "leopard-gecko/portrait-1",
    "title": "Cận cảnh đầu, mí mắt động và đồng tử dọc của Thằn lằn da báo",
    "scientificName": "Eublepharis macularius",
    "role": "portrait",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Ảnh chụp cận cảnh phần đầu thằn lằn da báo màu vàng tươi đốm đen, thấy rõ mí mắt có thể nhắm mở và đồng tử dọc.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/leopard-gecko/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAwAgCdASoQAAwAA8BgJagCdAYtpyc+9+gaiAD+sgYFJ/6ziiEUhN7FI1trCQaL9XgfV5rtVPvrs+0MZeeYe50hnfFOpKer0/4mDzZ5HKl4zDQAAAA=",
    "credit": {
      "author": "Christian von Faber-Castell",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:EUBLEPHARIS-MACULARIUS_Leopard-Gecko_Leopardgecko_201705276011.jpg"
    }
  },
  "leopard-gecko/habitat-1": {
    "id": "leopard-gecko/habitat-1",
    "title": "Sườn núi đá khô hạn lúc hoàng hôn tại Turbat, Balochistan, Pakistan",
    "scientificName": "Eublepharis macularius",
    "region": "Pakistan, Afghanistan và Tây Bắc Ấn Độ",
    "role": "habitat",
    "width": 1920,
    "height": 1098,
    "aspectRatio": 1.75,
    "focus": "50% 55%",
    "alt": "Dãy núi đá trầm tích khô cằn và thảm cây bụi thưa dưới ánh hoàng hôn tại Turbat, tỉnh Balochistan, Pakistan.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/leopard-gecko/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoQAAwAA8BgJZgCdAEOwCdlQAD+yOlca4/x7+hVovor1dn7DvK1CNO6tHlQSf8sl/fYAAAA",
    "credit": {
      "author": "Yasir Dora",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sunset_in_mountains,_Turbat,_Balochistan.jpg"
    }
  },
  "leopard-gecko/gallery-1": {
    "id": "leopard-gecko/gallery-1",
    "title": "Thằn lằn da báo dưới vòm cành cây khô (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "gallery",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Thằn lằn da báo Eublepharis macularius với lớp da đốm nâu đen dày đặc và mắt con ngươi dọc đang đứng dưới nhánh cây cong trên nền cát sáng.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/leopard-gecko/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJbACdADhK1oT7AAA/olFSnkVZP2m0RjTkExmWfoAezkZNj2xwOLi9TRFt4r4VV4gKNsPIhjpHvmuQotJ3332Qfr1pbm7IeRzvSowAAA=",
    "credit": {
      "author": "Ryan Somma",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Leopard_Gecko%2C_Eublepharis_macularius.jpg"
    }
  },
  "leopard-gecko/gallery-2": {
    "id": "leopard-gecko/gallery-2",
    "title": "Thằn lằn da báo trên nền sỏi đá núi lửa (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "gallery",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo Eublepharis macularius lưng vàng nhạt điểm đốm đen và đuôi khoang trắng xám đang bò trên lớp sỏi đá nhiều màu cạnh vách đá.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/leopard-gecko/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAQAgCdASoQAAwAA8BgJZgCdAYt9K/ocegAAP2Ogu3bX7cmmDw7+nrrCBwbLCJooZ8LRDhJt8WPfXvYNCyDZohQuF+5+6JmI+NmiY2FnYeE8lWdBz3uWir/7HvgAAAA",
    "credit": {
      "author": "Σ64",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eublepharis_macularius_04.jpg"
    }
  },
  "leopard-gecko/gallery-3": {
    "id": "leopard-gecko/gallery-3",
    "title": "Thằn lằn da báo leo trên phiến đá trong chuồng nuôi cạn",
    "scientificName": "Eublepharis macularius",
    "role": "gallery",
    "width": 960,
    "height": 719,
    "aspectRatio": 1.34,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo hoa văn vàng đốm đen đang đứng trên tảng đá cuội bên cạnh chén khoáng canxi.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/leopard-gecko/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/leopard-gecko/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/leopard-gecko/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADQAQCdASoQAAwAA8BgJQBOgCIhHVigAAD9tmfiezMmJLo2ydYmuhSYQsuf+upFyPQ/k1xH4yiI2iCBKZu4RZAL0xYBlJ8n6XXYBYAA",
    "credit": {
      "author": "Det at Czech Wikipedia",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:G._no%C4%8Dn%C3%AD.jpg"
    }
  },
  "venus-flytrap/hero-1": {
    "id": "venus-flytrap/hero-1",
    "title": "Cụm Cây bắt ruồi Venus ngoài tự nhiên tại Green Swamp, Bắc Carolina",
    "scientificName": "Dionaea muscipula",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cụm cây bắt ruồi Dionaea muscipula với các lá bẫy xanh tươi và lòng hồng đỏ đang bắt côn trùng tại khu bảo tồn Green Swamp, Bắc Carolina, Hoa Kỳ.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/venus-flytrap/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/venus-flytrap/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/venus-flytrap/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQAAwAA8BgJbACdAD8p+bYvV3YAM3P4dvbACO0K9nrYRct5Dm6BBflBcHrA+cF97rsXGiaEmaEdh607kq2u0TT4EAWEVwnu/yut/ZHnluCLUE5AAA=",
    "credit": {
      "author": "Judy Gallagher",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_Flytrap_-_Dionaea_muscipula,_Green_Swamp,_Supply,_North_Carolina,_October_18,_2021_(51693075042).jpg"
    }
  },
  "venus-flytrap/portrait-1": {
    "id": "venus-flytrap/portrait-1",
    "title": "Hai thùy lá bẫy và hàng gai viền của Cây bắt ruồi Venus",
    "scientificName": "Dionaea muscipula",
    "role": "portrait",
    "width": 960,
    "height": 960,
    "aspectRatio": 1,
    "focus": "50% 48%",
    "alt": "Cận cảnh hai chiếc bẫy lá Dionaea muscipula màu xanh viền gai răng lược và lòng bẫy ánh hồng giữa lớp lá thông khô.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAwAgCdASoQAAwAA8BgJagCdAYuHCV6as2CAAD+8XMdDFYcImphWcDwf0j8/eb3tF3oEqtoNTYIDF0F+KvFH4xmfnpCu6x9dcCKCtklrj0YIAPpSiTwpdtfVS19Sda1JuwMAAAA",
    "credit": {
      "author": "Judy Gallagher",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_flytrap_(53886303376).jpg"
    }
  },
  "venus-flytrap/habitat-1": {
    "id": "venus-flytrap/habitat-1",
    "title": "Thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, Hoa Kỳ",
    "scientificName": "Dionaea muscipula",
    "region": "Duyên hải Bắc và Nam Carolina, Hoa Kỳ",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Rừng thông lá dài thưa tán với thảm cỏ ẩm dưới nắng tại vùng duyên hải Bắc Carolina, Hoa Kỳ — sinh cảnh tự nhiên của cây bắt ruồi Venus.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAACQAQCdASoQAAwAA8BgJYgCdAB/hEgA/t37ELC49FJnx1GEb7OA6VYycyYJToTfj4jTfc3/MRfQ/KfYPuB8IEIryvBME/faMbQYPSfYcshsG/XihJAAAA==",
    "credit": {
      "author": "Justin Meissen from St Paul, United States",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Longleaf_Pine_Savanna_II_(13158080455).jpg"
    }
  },
  "venus-flytrap/gallery-1": {
    "id": "venus-flytrap/gallery-1",
    "title": "Đại cận cảnh sáu sợi lông cảm ứng trong lòng bẫy Cây bắt ruồi Venus",
    "scientificName": "Dionaea muscipula",
    "role": "gallery",
    "width": 960,
    "height": 1050,
    "aspectRatio": 0.91,
    "focus": "50% 50%",
    "alt": "Ảnh chụp đại cận cảnh hai thùy lá bẫy màu đỏ tươi của Dionaea muscipula mở rộng, lộ rõ ba sợi lông cảm ứng cơ học trên mỗi thùy.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAAAwAgCdASoQAAwAA8BgJbACdAEfA6xy+KC8AAD+3iz+p+uHkpfLL99ueuHQ4ymmX6d2ei1OzlJi55VVIHrs495vZES9biwrGUf67moXY88FNBUXI10NfUT6sQwe+9YYeahGEy76XRPLc92cAAA=",
    "credit": {
      "author": "Noah Elhardt",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_Flytrap_showing_trigger_hairs.jpg"
    }
  },
  "venus-flytrap/gallery-2": {
    "id": "venus-flytrap/gallery-2",
    "title": "Hoa trắng năm cánh của Cây bắt ruồi Venus (Dionaea muscipula)",
    "scientificName": "Dionaea muscipula",
    "role": "gallery",
    "width": 960,
    "height": 640,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cận cảnh bông hoa màu trắng năm cánh với gân xanh nhạt và nhị vàng của loài cây bắt ruồi Dionaea muscipula.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADwAQCdASoQAAwAA8BgJQAAX4t6eekeHgAA/vNUU8DcNoDP1wSiYdO3TvbR/XIOOnvZuc76Byf9Q7+eEqWmaq9V+BRTqXScpvFjIMuoCaPjgfgJb6MjIeBzCJk1wAAA",
    "credit": {
      "author": "Calyponte",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dionaea_muscipula_flower_1.JPG"
    }
  },
  "venus-flytrap/gallery-3": {
    "id": "venus-flytrap/gallery-3",
    "title": "Cụm Cây bắt ruồi Venus trồng chậu tại Vườn thực vật Skopje",
    "scientificName": "Dionaea muscipula",
    "role": "gallery",
    "width": 960,
    "height": 640,
    "aspectRatio": 1.5,
    "focus": "50% 55%",
    "alt": "Chậu cây bắt ruồi Dionaea muscipula với nhiều bẫy lá xanh lòng đỏ hồng đang mở rộng dưới ánh nắng.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/venus-flytrap/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAABQAgCdASoQAAwAA8BgJbACdH8AGBoZCZwT5eAA/t6tDSS3vhDC4Wh+IrBlnZGBHkH2djGgHr1j2ajM8RaojGzBPGoSXuqsJMpn/7vel7Aaj2tIVBwAAA==",
    "credit": {
      "author": "Dandarmkd",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dionaea_muscipula_-_%D0%91%D0%BE%D1%82%D0%B0%D0%BD%D0%B8%D1%87%D0%BA%D0%B0_%D0%B3%D1%80%D0%B0%D0%B4%D0%B8%D0%BD%D0%B0_%D0%A1%D0%BA%D0%BE%D0%BF%D1%98%D0%B5_(1).jpg"
    }
  },
  "burmese-python/hero-1": {
    "id": "burmese-python/hero-1",
    "title": "Trăn đất hoang dã tại Vườn quốc gia Bardiya, Nepal",
    "scientificName": "Python bivittatus",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "52% 50%",
    "alt": "Góc chụp nghiêng phần đầu của trăn đất Python bivittatus đang tựa trên cành cây xanh tại Vườn quốc gia Bardiya, Nepal.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/burmese-python/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/burmese-python/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/burmese-python/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJagCdACz1hIeVpAA/vW9yugXQzGcHJcU2YFIZK3hodGURIOXjmMmzCrAzA65WIkq06W5Rc9fMZU5qKm/ycYcqcdAvNlj1WATk8nIAAA=",
    "credit": {
      "author": "Shadow Ayush",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_photographed_at_Bardiya_National_Park2.jpg"
    }
  },
  "burmese-python/portrait-1": {
    "id": "burmese-python/portrait-1",
    "title": "Cận cảnh đầu và thân cuộn của Trăn đất (Python bivittatus)",
    "scientificName": "Python bivittatus",
    "role": "portrait",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 45%",
    "alt": "Cận cảnh phần đầu với vệt mũi tên tối màu và lớp vảy bóng của cá thể trăn đất Python bivittatus đang cuộn mình.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/burmese-python/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/burmese-python/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/burmese-python/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAwAA8BgJQBOgCPpyKQTfVtgAP7zSWZOUF+3wBV6gW+BR0iRgEnoBCwBqZ7t+qmq1lhchY+8E0+wLEVl2gnCOJVrXadXDoGoAA==",
    "credit": {
      "author": "SuperJew",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_03.jpg"
    }
  },
  "burmese-python/habitat-1": {
    "id": "burmese-python/habitat-1",
    "title": "Rễ bành cây cổ thụ tại rừng nhiệt đới Vườn quốc gia Cát Tiên, Việt Nam",
    "scientificName": "Python bivittatus",
    "region": "Nam và Đông Nam Á",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Hệ rễ bành khổng lồ của cây tung cổ thụ giữa rừng mưa nhiệt đới đất thấp tại Vườn quốc gia Cát Tiên, Đồng Nai, Việt Nam.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/burmese-python/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoQAAwAA8BgJYwAAhd/fc3UAAD+49M2Zj6cGDM0OkfLWQdWMIqEMh1XIegKYtjMwRSpeD70X/LGqQLEsy+3R4AA",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cat_Tien_Park,_Vietnam,_tropical_forest,_roots.jpg"
    }
  },
  "burmese-python/gallery-1": {
    "id": "burmese-python/gallery-1",
    "title": "Hoa văn hình mũi tên trên đỉnh đầu Trăn đất (Python bivittatus)",
    "scientificName": "Python bivittatus",
    "role": "gallery",
    "width": 960,
    "height": 738,
    "aspectRatio": 1.3,
    "focus": "55% 50%",
    "alt": "Góc chụp từ trên xuống phần đầu và cổ của trăn đất Python bivittatus thể hiện rõ hoa văn hình mũi tên nâu sẫm viền vàng kem.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/burmese-python/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/burmese-python/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/burmese-python/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAwAgCdASoQAAwAA8BgJYwCdAYtA9uDCG6gAAD+6f40HkLUam1Vzu8j5pmHMX6M1LpUePlTplU+fO/6cDL4ub4axQ1hN9jpy4ifZu1NFPR/eaLUL6EB2n6XIAA=",
    "credit": {
      "author": "Bernard Dupont",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_(Python_molurus_bivittatus)_(7807920144).jpg"
    }
  },
  "burmese-python/gallery-2": {
    "id": "burmese-python/gallery-2",
    "title": "Các vòng thân và lớp vảy hoa văn da báo của Trăn đất",
    "scientificName": "Python bivittatus",
    "role": "gallery",
    "width": 960,
    "height": 639,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể trăn đất Python bivittatus cuộn nhiều vòng thân dày với các mảng màu nâu đồng viền đen ánh kim.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/burmese-python/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/burmese-python/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/burmese-python/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAQAgCdASoQAAwAA8BgJZwAD5RRf+RsmLUAAP66JuV4go+GeBOxIMidQqxdJsLsNOTSrK/+W9Al0mYwVrxtJ2NVLjURYL69jNOiylIdRtVwIEAA",
    "credit": {
      "author": "NasserHalaweh",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pythonidae_Python_bivittatus_2.jpg"
    }
  },
  "bearded-dragon/hero-1": {
    "id": "bearded-dragon/hero-1",
    "title": "Rồng Úc phơi nắng trên nền cát (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "hero",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 45%",
    "alt": "Cá thể Rồng Úc Pogona vitticeps màu vàng cát đang nằm phơi nắng trên nền cát mịn, lộ rõ hàng vảy gai chạy dọc hai bên sườn.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/bearded-dragon/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/bearded-dragon/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/bearded-dragon/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAgCdASoQAAwAA8BgJaACdAEWPbZrwIAAAOAT7k3/CprOTtu1/a0l13NFNdp91Yp5Ck9e5apShsoBgQAAAA==",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_close-up_2009_G1.jpg"
    }
  },
  "bearded-dragon/portrait-1": {
    "id": "bearded-dragon/portrait-1",
    "title": "Hình thái toàn thân nhìn từ trên xuống của Rồng Úc",
    "scientificName": "Pogona vitticeps",
    "role": "portrait",
    "width": 960,
    "height": 540,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Góc chụp từ trên xuống toàn bộ cơ thể dẹp rộng, đầu hình tam giác và đuôi dài của Rồng Úc Pogona vitticeps trên cát.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAABwAQCdASoQAAwAA8BgJZACdAAAAABpC1JQEHqARGFy8XVlBq8YI2GoH1xex30VK0mkSAAA",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_2009_G1.jpg"
    }
  },
  "bearded-dragon/habitat-1": {
    "id": "bearded-dragon/habitat-1",
    "title": "Bán hoang mạc đất đỏ tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc",
    "scientificName": "Pogona vitticeps",
    "region": "Miền Trung nước Úc",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Khối đá sa thạch đỏ Uluru vươn cao trên thảm cỏ khô và cây gỗ thưa tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAwAA8BgJbACdAD0E6kybAAA/nye9N+dmvzBmnfpMUHxDKOoFAdy6IEWE3STXlOGn5E3fyJxeVn3RY29G18lKIAAAA==",
    "credit": {
      "author": "Dietmar Rabich",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Petermann_Ranges_(AU),_Uluru-Kata_Tjuta_National_Park,_Uluru,_Kuniya_Walk_--_2019_--_3615.jpg"
    }
  },
  "bearded-dragon/gallery-1": {
    "id": "bearded-dragon/gallery-1",
    "title": "Chân dung Rồng Úc ngẩng đầu bên vách đá sa thạch (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "gallery",
    "width": 1920,
    "height": 1442,
    "aspectRatio": 1.33,
    "focus": "60% 45%",
    "alt": "Cận cảnh đầu và cổ Rồng Úc Pogona vitticeps màu vàng cát sáng đang bám trên tảng đá sa thạch, nổi bật với hàng vảy gai nhọn quanh hàm và cổ họng.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAABwAgCdASoQAAwAA8BgJaACdAYvry/win1DVRgAAOJkMJUvgBgREn2/VmPYRjI1Vr8EC+uECx18Z9UEeO+w3EzxJOT+EoY6rN4k+VkuFEKUaoIMjJeIXVR2pjeDLbT4AAA=",
    "credit": {
      "author": "Basotxerri",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Osnabr%C3%BCck_-_Zoo_-_Pogona_vitticeps_01.jpg"
    }
  },
  "bearded-dragon/gallery-2": {
    "id": "bearded-dragon/gallery-2",
    "title": "Rồng Úc hoang dã nằm phơi nắng trên nền sỏi đá đỏ (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "gallery",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể Rồng Úc Pogona vitticeps màu nâu xám tự nhiên nằm áp sát mặt đất trải đầy sỏi đá đỏ trắng và những cụm cây bụi nhỏ ngoài hoang mạc.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAQCdASoQAAwAA8BgJQBOgBTvWyTAAPxnV5CTt/3aiSJfC8as8sqdn1jGkRymmImdFXaACg8sLjCaS2yygGBAAAA=",
    "credit": {
      "author": "PeterBur63",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_0012.jpg"
    }
  },
  "bearded-dragon/gallery-3": {
    "id": "bearded-dragon/gallery-3",
    "title": "Rồng Úc hoang dã sắc cam đỏ trên mỏm đá tại miền Trung nước Úc",
    "scientificName": "Pogona vitticeps",
    "role": "gallery",
    "width": 960,
    "height": 719,
    "aspectRatio": 1.34,
    "focus": "45% 45%",
    "alt": "Cá thể Rồng Úc Pogona vitticeps hoang dã với phần đầu và cổ ánh màu cam đất đang đứng trên mỏm đá dưới nắng tại Úc.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/gallery-3-480.avif",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-3-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/gallery-3-480.webp",
          "width": 480
        },
        {
          "src": "photos/bearded-dragon/gallery-3-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/gallery-3-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJaACdACVEe4JFAAA/X/VFYXZn3cMbD8ThmYRXo/n3HEI9/JqMgCsadxne0X2o2qpmXVR2pjWXMraAAA=",
    "credit": {
      "author": "Christopher Watson",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_1_-_Christopher_Watson.jpg"
    }
  },
  "hermann-tortoise/hero-1": {
    "id": "hermann-tortoise/hero-1",
    "title": "Rùa Hermann bước đi trên thảm cỏ hoa cúc trắng (Testudo hermanni)",
    "scientificName": "Testudo hermanni",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 52%",
    "alt": "Cá thể rùa cạn Testudo hermanni với chiếc mai vòm màu vàng rơm đốm đen đang bước đi giữa thảm cỏ xanh và hoa cúc trắng.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/hermann-tortoise/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/hermann-tortoise/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/hermann-tortoise/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJZgC7AC3W2OkIgAA/u6kdWwUp4OwxUqG8phh9AvsntaytkV2uZiVSlr+RkySFHTroJJ48tBPh05a4uWMWHh6GwAAAA==",
    "credit": {
      "author": "NorbertNagel",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_Boettgeri_-_01.jpg"
    }
  },
  "hermann-tortoise/portrait-1": {
    "id": "hermann-tortoise/portrait-1",
    "title": "Cận cảnh đầu, chân vảy lớn và mai trước của Rùa Hermann",
    "scientificName": "Testudo hermanni",
    "role": "portrait",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Góc chụp cận cảnh phần đầu và hai chân trước phủ vảy dày của rùa Hermann ẩn mình giữa đám cỏ xanh.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/hermann-tortoise/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAACwAQCdASoQAAwAA8BgJZgCdADvWwQAAP4vRl633UyBTMujmcSb2DgSy/zn2a8NfiDCP+BVQgZfuOYH9t3sZJ5YEhkyOGUNWH0eQP2l8Je9d/j4ogAAAA==",
    "credit": {
      "author": "Olaf Tausch",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_hermanni_01.jpg"
    }
  },
  "hermann-tortoise/habitat-1": {
    "id": "hermann-tortoise/habitat-1",
    "title": "Thảm thực vật cây bụi Maquis tại dãy Massif des Maures, miền Nam nước Pháp",
    "scientificName": "Testudo hermanni",
    "region": "Nam Âu — Địa Trung Hải",
    "role": "habitat",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Sườn đồi phủ thảm cây bụi Maquis và hoa thạch nam trắng tại dãy Massif des Maures, vùng Provence, miền Nam nước Pháp.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/hermann-tortoise/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAwAA8BgJQBOgCKqxwuy6AD+6uU7CjQf/dr6AOce68XBMbstvJqfVAOMKJU7980erWnqxj0AAA==",
    "credit": {
      "author": "AmélieBertaigne",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Formation_maquis.jpg"
    }
  },
  "hermann-tortoise/gallery-1": {
    "id": "hermann-tortoise/gallery-1",
    "title": "Rùa Hermann con vừa nở đang chui ra khỏi vỏ trứng",
    "scientificName": "Testudo hermanni",
    "role": "gallery",
    "width": 960,
    "height": 643,
    "aspectRatio": 1.49,
    "focus": "50% 50%",
    "alt": "Khoảnh khắc cá thể rùa Hermann non (Testudo hermanni) thò đầu và chân trước có vảy ra khỏi lớp vỏ trứng trắng vừa nứt.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/hermann-tortoise/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAwAgCdASoQAAwAA8BgJZACdAEfoQP5SQ0/IAD+ujyK6nRhJ8ESen5TRxsWAdZeGzHnLZvbMX6SbhwfJ4AoSCcGXEpCnBneVjQ/o74V1wMXboAA",
    "credit": {
      "author": "Berthold Werner",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_BW_2015-07-27_14-04-03.jpg"
    }
  },
  "hermann-tortoise/gallery-2": {
    "id": "hermann-tortoise/gallery-2",
    "title": "Rùa Hermann phân loài phương Đông tại đảo Pag, Croatia",
    "scientificName": "Testudo hermanni",
    "role": "gallery",
    "width": 960,
    "height": 731,
    "aspectRatio": 1.31,
    "focus": "50% 50%",
    "alt": "Cá thể rùa cạn Testudo hermanni boettgeri với mai vòm cao màu vàng lục và các mảng đen rõ nét đang bò trên nền đá vôi tại đảo Pag, Croatia.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/hermann-tortoise/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/hermann-tortoise/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJQBOgCKZl/kbyAAA/udAVIw2+uQnUkS6hpxeo6t1fiaSeZKzT/CQpCXCgzngiF+gkFlpGqQY9fgAAAA=",
    "credit": {
      "author": "Palauenc05",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hermanni_boettgeri_Pag.jpg"
    }
  },
  "nepenthes-ampullaria/hero-1": {
    "id": "nepenthes-ampullaria/hero-1",
    "title": "Cụm lá sát đất và ấm tròn của Nắp ấm Ampullaria",
    "scientificName": "Nepenthes ampullaria",
    "role": "hero",
    "width": 1920,
    "height": 1271,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Cụm lá non xanh bóng mọc sát mặt đất bao quanh bởi những chiếc bình ấm tròn màu xanh lục của loài Nepenthes ampullaria trên nền rêu và lá khô.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/hero-960.avif",
          "width": 960
        },
        {
          "src": "photos/nepenthes-ampullaria/hero-1600.avif",
          "width": 1600
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/hero-960.webp",
          "width": 960
        },
        {
          "src": "photos/nepenthes-ampullaria/hero-1600.webp",
          "width": 1600
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/hero-1600.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAwAA8BgJQBOgCPUpxLJQAD+zDL+ZC8h+uv4eafMOhUYuHx6e5B4eGL1ToAHFvbTPUvtN67AAFqfl/sCbiMYOz3EgDr3AAA=",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pitcher_Plant_(Nepenthes_ampullaria)_(14136485484).jpg"
    }
  },
  "nepenthes-ampullaria/portrait-1": {
    "id": "nepenthes-ampullaria/portrait-1",
    "title": "Chùm bình Nắp ấm Ampullaria xanh đốm đỏ nâu trên thân leo",
    "scientificName": "Nepenthes ampullaria",
    "role": "portrait",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Chùm nhiều bình ấm hình cầu màu xanh cốm điểm đốm đỏ nâu với vành môi xanh bóng của loài Nepenthes ampullaria trong rừng ẩm.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/portrait-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/portrait-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoQAAwAA8BgJagC7AYwxgfwUqwpQAD+7q3ddNq5IWdG5ptHnFbhrTXzYQ01EK0r6pz4P2nXaNqHgmfWYPGIKOJl0Mg1cEldzUtwi3+UzNu/G8NVCsQ8AAAA",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pitcher_Plants_(Nepenthes_ampullaria)_(8410326499).jpg"
    }
  },
  "nepenthes-ampullaria/habitat-1": {
    "id": "nepenthes-ampullaria/habitat-1",
    "title": "Rừng đầm lầy than bùn ngập nước tại Borneo",
    "scientificName": "Nepenthes ampullaria",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "habitat",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Những thân cây có gốc bành đứng giữa mặt nước sẫm màu trong khu rừng đầm lầy than bùn đất thấp tại đảo Borneo.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/habitat-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/habitat-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/habitat-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAQCdASoQAAwAA8BgJQBYdhJoZfggAN2qqA5HmnAgS4fEyLrxPw+YkCN5tRGNAvIUnxlkZ2Z3wq2G4GVI4hhtVLK2oZgvEksa4eaQfLwtaIgA",
    "credit": {
      "author": "shankar s. from Dubai, united arab emirates",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_view_of_the_old_rainforest-_not_much_left_unfortunately_(11463945203).jpg"
    }
  },
  "nepenthes-ampullaria/gallery-1": {
    "id": "nepenthes-ampullaria/gallery-1",
    "title": "Thảm ấm đất của Nắp ấm Ampullaria hứng lá mục dưới tán rừng",
    "scientificName": "Nepenthes ampullaria",
    "role": "gallery",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Quần thể hàng chục bình ấm Nepenthes ampullaria mọc chen chúc giữa lớp rêu và cành lá khô rụng trên nền rừng.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/gallery-1-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/gallery-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/gallery-1-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/gallery-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/gallery-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAwAA8BgJZACdAC8E42CrAAA+5SIGv56Td+JeWOhVMdlpVHYmNWqnNYlWxaLyULlBBO6fstGeMZpaFhBm1Jt2BsWlCwwmCcibswfAAA=",
    "credit": {
      "author": "Mgiganteus",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_ampullaria_elongated.jpg"
    }
  },
  "nepenthes-ampullaria/gallery-2": {
    "id": "nepenthes-ampullaria/gallery-2",
    "title": "Miệng ấm tròn mở rộng và nắp ngửa đặc trưng của Nắp ấm Ampullaria",
    "scientificName": "Nepenthes ampullaria",
    "role": "gallery",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cận cảnh cụm bình Nepenthes ampullaria màu xanh lục với nắp bình nhỏ hẹp uốn ngửa ra sau để hứng mùn lá rụng.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/gallery-2-480.avif",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/gallery-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/gallery-2-480.webp",
          "width": 480
        },
        {
          "src": "photos/nepenthes-ampullaria/gallery-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/gallery-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABQAgCdASoQAAwAA8BgJQBOgMWl5T82wTU2+wAA/sEZKE/rkenLv2kqfTzlO0t4Wj/HKIBEfXRylnTHpBDSYzb5tM/xCg3qhPviapcO23HC2ipLw5kgP5jkCyIgCYwwWM6sJ9SDcAA=",
    "credit": {
      "author": "scott.zona",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_ampullaria_-_Atlanta_Botanical_Garden.jpg"
    }
  },
  "prod-gecko-1": {
    "id": "prod-gecko-1",
    "title": "Thằn lằn da báo dòng High Yellow săn mồi (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "product",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo Eublepharis macularius dòng High Yellow nền vàng đốm đen đang quan sát con gián Dubia.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-gecko-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-gecko-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-gecko-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACQAQCdASoQAAwAA8BgJYwAAf0wkoAA/iem/bIOdnu26wEghuxT7PCt67wChdZcJQEjJv/ECxcKmvTH1DMMmH+3AtwAAA==",
    "credit": {
      "author": "Michał Zawiślak (mihauz @)",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eublepharis_macularius_1.jpg"
    }
  },
  "prod-gecko-2": {
    "id": "prod-gecko-2",
    "title": "Thằn lằn da báo tông vàng cam (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "product",
    "width": 960,
    "height": 640,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cận cảnh cá thể thằn lằn da báo Eublepharis macularius có sắc da vàng cam tươi sáng điểm các đốm nâu đen trên nền cát trắng.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-gecko-2-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-gecko-2-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-gecko-2-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAwAA8BgJbACdAEf6mr9MowAAN/KCspuh9pQx5IZ/VPoLewi5O1S6mbFGB7wnxfRtTDyZqN2JMUr/tbhyi3DI340oYAA",
    "credit": {
      "author": "Christian von Faber-Castell",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:EUBLEPHARIS-MACULARIUS_Leopard-Gecko_Leopardgecko_201705276007.jpg"
    }
  },
  "prod-bearded-dragon-1": {
    "id": "prod-bearded-dragon-1",
    "title": "Rồng Úc sưởi ấm trên phiến đá trong chuồng nuôi (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "product",
    "width": 960,
    "height": 721,
    "aspectRatio": 1.33,
    "focus": "50% 45%",
    "alt": "Cận cảnh cá thể Rồng Úc Pogona vitticeps màu vàng sáng đang tựa hai chân trước lên phiến đá dưới đèn sưởi.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-bearded-dragon-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-bearded-dragon-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-bearded-dragon-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAACQAgCdASoQAAwAA8BgJbACdAYuRzph0ZdAzcXNgAD+76L6Ireb6xTLC01sUtYGk4Ef0muFAB0DG2duGX+gL77dNeCtwWEJhq5v26gRKIaJXghw7JTQmQrr+sFet6Hb1sxp36jRUIL77Y5GMje/eV94zaOyr85+gAA=",
    "credit": {
      "author": "Vicki Nunn",
      "license": "PD",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Bearded_Dragon2.jpg"
    }
  },
  "prod-ball-python-1": {
    "id": "prod-ball-python-1",
    "title": "Trăn bóng dòng đột biến Pastel (Python regius)",
    "scientificName": "Python regius",
    "role": "product",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể trăn bóng Python regius dòng Pastel cuộn tròn trên nền dăm gỗ với sắc vàng chanh tươi sáng xen các mảng đen.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-ball-python-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-ball-python-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-ball-python-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoQAAwAA8BgJYgCdAYuvPdgj1kAAP62dKpOFoa7SmtcYm4DBxoMyh/iwE/kPreb8y3E+zhd5At0rvrGXfFw6C22u5uobO3PcrOcgob0kDMX3wsDIx8yMJpF8+Q5AAAA",
    "credit": {
      "author": "Cody Campbell",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_Regius_Pastel.jpg"
    }
  },
  "prod-burmese-python-1": {
    "id": "prod-burmese-python-1",
    "title": "Trăn đất dòng đột biến bạch tạng Albino (Python bivittatus)",
    "scientificName": "Python bivittatus",
    "role": "product",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể trăn đất Python bivittatus dòng Albino với các mảng vảy màu vàng tươi trên nền trắng ngà và mắt hồng đỏ.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-burmese-python-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-burmese-python-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-burmese-python-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAwAgCdASoQAAwAA8BgJbACdAELz6INOyqSoAD+uDq0/XdXkDaM5oh9vR9BIcXduc28MgGCmPermsrLdj4qwFVfQrxTkxNaZ0vOjcwgAAA=",
    "credit": {
      "author": "Danleo~commonswiki",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_02.jpg"
    }
  },
  "prod-hermann-tortoise-1": {
    "id": "prod-hermann-tortoise-1",
    "title": "Rùa Hermann trên nền đất sỏi tự nhiên (Testudo hermanni)",
    "scientificName": "Testudo hermanni",
    "role": "product",
    "width": 960,
    "height": 639,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Góc nhìn từ trên xuống chiếc mai vòm vàng rơm điểm các mảng đen đối xứng của rùa cạn Testudo hermanni trên nền đất sỏi.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-hermann-tortoise-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-hermann-tortoise-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-hermann-tortoise-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAwAA8BgJQBOgBSlqCUppiAA/nio+TRDjXwi6d+P8Asjf75sLUS68EG2R56eyh+OZk07GDw1Rz7F1g9Qj11GhYvTBYjDQEbbIAAA",
    "credit": {
      "author": "Jean-Pol GRANDMONT",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_JPG.jpg"
    }
  },
  "prod-axolotl-1": {
    "id": "prod-axolotl-1",
    "title": "Kỳ giông Axolotl dòng Leucistic hồng nhạt (Ambystoma mexicanum)",
    "scientificName": "Ambystoma mexicanum",
    "role": "product",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Cá thể kỳ giông Axolotl đột biến Leucistic thân trắng hồng nhạt với ba cặp mang ngoài màu đỏ hồng nổi bật.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-axolotl-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-axolotl-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-axolotl-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJQBOgBuyaclh/gAA/vD78wlsSEfF4IdJUC+VuPImkHgKOPJEsrdVkAtcbVd6palnMVfsWcuO3VHyDUB4InnCG+AAAA==",
    "credit": {
      "author": "Amandasofiarana",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Axolotl_ambystoma_mexicanum_anfibio_ASAG.jpg"
    }
  },
  "prod-venus-flytrap-1": {
    "id": "prod-venus-flytrap-1",
    "title": "Cây bắt ruồi Venus trồng chậu với lòng bẫy đỏ thẫm",
    "scientificName": "Dionaea muscipula",
    "role": "product",
    "width": 960,
    "height": 640,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cận cảnh lá bẫy cây bắt ruồi Dionaea muscipula lòng đỏ thẫm và hàng gai dài trồng trong chậu nhựa nhỏ.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-venus-flytrap-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-venus-flytrap-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-venus-flytrap-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADwAQCdASoQAAwAA8BgJbACdADx911InIAA/u+RW/tqrVvyxz+Bv27SNf7oDW2qUfyq4v2c9u13PLqJfkInxTMUkVUjVfpBechmgOvyLNDDFR/wyiAAAA==",
    "credit": {
      "author": "che",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dionaea_muscipula_trap.jpg"
    }
  },
  "prod-nepenthes-rajah-1": {
    "id": "prod-nepenthes-rajah-1",
    "title": "Cây Nắp ấm Rajah non với tán lá xanh và bình đỏ tía",
    "scientificName": "Nepenthes rajah",
    "role": "product",
    "width": 960,
    "height": 720,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cây Nepenthes rajah kích thước nhỏ với cụm lá xanh bóng sát đất và một bình ấm màu đỏ tía đang phát triển.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-nepenthes-rajah-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-nepenthes-rajah-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-nepenthes-rajah-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAQCdASoQAAwAA8BgJZgCdABXb/oAAM3TPYdXbv5eOfpXK+viZUANBwYE10JKt0zdupzGQj9/kBbtZP+OtWLo5HHEBo+/FFzTFfpF4jc651wykfCJiwAA",
    "credit": {
      "author": "NepGrower at English Wikipedia",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_rajah_(5).jpg"
    }
  },
  "prod-nepenthes-ampullaria-1": {
    "id": "prod-nepenthes-ampullaria-1",
    "title": "Bình Nắp ấm Ampullaria dòng xanh thuần (All-green)",
    "scientificName": "Nepenthes ampullaria",
    "role": "product",
    "width": 960,
    "height": 1280,
    "aspectRatio": 0.75,
    "focus": "50% 50%",
    "alt": "Cận cảnh chiếc bình ấm Nepenthes ampullaria màu xanh cốm thuần khiết với vành môi cuộn tròn bóng mượt giữa lớp lá mục.",
    "sources": {
      "avif": [
        {
          "src": "photos/products/prod-nepenthes-ampullaria-1-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/products/prod-nepenthes-ampullaria-1-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/products/prod-nepenthes-ampullaria-1-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoQAAwAA8BgJbACdAC9IJAsh5AAAMsv7RV3P2KTxaNk9YCz7YNB3fUiHflq6rqqjso3S3f26oqgOToTEvw3sR8egHQOl7LiEpbb326ZkhGh7UB7HCPtU2iEOcuYrwAA",
    "credit": {
      "author": "NepGrower",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nep_amp_295.jpg"
    }
  },
  "biome/cuc-phuong-rainforest-trail": {
    "id": "biome/cuc-phuong-rainforest-trail",
    "title": "Đường mòn ngập nước trong rừng mưa Vườn quốc gia Cúc Phương, Ninh Bình, Việt Nam",
    "region": "Nam và Đông Nam Á",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Con đường mòn đất ngập nước nông xuyên qua tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Cúc Phương, tỉnh Ninh Bình, Việt Nam.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/cuc-phuong-rainforest-trail-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/cuc-phuong-rainforest-trail-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/cuc-phuong-rainforest-trail-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAwAA8BgJYwCdACKIPiEAAD+6aZcsgaolQM5grpS6zmmxVIsPtyWPg3T2a/uzeZePQOjuMmiAAAA",
    "credit": {
      "author": "hds",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Forest_in_Cuc_Phuong_National_Park_(15706323528).jpg"
    }
  },
  "biome/taman-negara-canopy-walkway": {
    "id": "biome/taman-negara-canopy-walkway",
    "title": "Cầu treo xuyên tán rừng mưa tại Vườn quốc gia Taman Negara, Pahang, Malaysia",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cầu treo bằng dây thừng và ván gỗ đi xuyên qua tầng tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Taman Negara, bang Pahang, Malaysia.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/taman-negara-canopy-walkway-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/taman-negara-canopy-walkway-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/taman-negara-canopy-walkway-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACQAQCdASoQAAwAA8BgJYwAAoTJTAAA/tHs7S0Jpl0gJ/MAh7Ev1rkVBhwVnnegGDMnIhKxgd9lT5hK1Gh3vGNP4hF9dmpfww4dhcvfUuaCePwAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Taman_Negara,_Malaysia,_Canopy_Walkway.jpg"
    }
  },
  "biome/tembeling-river-taman-negara": {
    "id": "biome/tembeling-river-taman-negara",
    "title": "Thuyền gỗ trên sông Tembeling ven rừng mưa Taman Negara, Kuala Tahan, Malaysia",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Chiếc thuyền gỗ nhỏ chở người dân địa phương trên dòng sông Tembeling bao quanh bởi rừng mưa nhiệt đới tại Kuala Tahan, Vườn quốc gia Taman Negara, Malaysia.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/tembeling-river-taman-negara-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/tembeling-river-taman-negara-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/tembeling-river-taman-negara-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJZwAAujXw4F1TMAA99/5n7IkqenvlvCfZ6QuwO3f++TPlDmKFQCeptGg14fv80pUeHBzi467d7CAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fishing_on_Tembeling_River,_Taman_Negara,_Malaysia.jpg"
    }
  },
  "biome/calanque-cassis-mediterranean": {
    "id": "biome/calanque-cassis-mediterranean",
    "title": "Rừng thông ven biển Địa Trung Hải tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp",
    "region": "Nam Âu — Địa Trung Hải",
    "role": "biome",
    "width": 1920,
    "height": 1152,
    "aspectRatio": 1.67,
    "focus": "50% 50%",
    "alt": "Lối mòn đá vôi dưới tán rừng thông Aleppo dẫn ra làn nước biển xanh biếc tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/calanque-cassis-mediterranean-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/calanque-cassis-mediterranean-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/calanque-cassis-mediterranean-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAQCdASoQAAwAA8BgJZwAAlZHq/W3AAD+5sH7yITaIJMRBJ6ldM7oxDsTyzM0fB710In3Dw7h4jy9f/iSLtJ1mCdmY64Ycgf/9Bh5a5qZMkfAdNFUcAAA",
    "credit": {
      "author": "Cocosea",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Calanque_de_Cassis.jpg"
    }
  },
  "biome/montane-cloud-tree-ferns": {
    "id": "biome/montane-cloud-tree-ferns",
    "title": "Tán dương xỉ thân gỗ vươn cao giữa rừng mây sương mù",
    "region": "Rừng mây nhiệt đới",
    "role": "biome",
    "width": 1920,
    "height": 1262,
    "aspectRatio": 1.52,
    "focus": "50% 50%",
    "alt": "Những vòm lá dương xỉ thân gỗ Cyathea xanh mướt nổi bật trước sườn rừng núi cao phủ đầy mây mù.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/montane-cloud-tree-ferns-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/montane-cloud-tree-ferns-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/montane-cloud-tree-ferns-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAwAA8BgJYgCdAELLK8YaAAA/uhRsQ7ItAMI5hLI5CMBV//PYax7ECy1h6FRxQ4pEtzCZZetnX1jWPVNZRSJa+jDjjVdAAA=",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tree_Ferns_(Cyathea_sp.)_and_Montane_Forest_(14647918801).jpg"
    }
  }
};

export const TRIP_PHOTOS: Record<string, PhotoMetadata> = {
  "trail": {
    "id": "trip/trail",
    "title": "Đường mòn ngập nước trong rừng mưa VQG Cúc Phương, Ninh Bình",
    "region": "Nam và Đông Nam Á",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Con đường mòn đất ngập nước nông xuyên qua tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Cúc Phương, Ninh Bình, Việt Nam.",
    "sources": {
      "avif": [
        {
          "src": "trip/trail-960.avif",
          "width": 960
        },
        {
          "src": "trip/trail-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/trail-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/trail-960.webp",
          "width": 960
        },
        {
          "src": "trip/trail-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/trail-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/trail.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/trail.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAwAA8BgJYwCdACKIPiEAAD+6aZcsgaolQM5grpS6zmmxVIsPtyWPg3T2a/uzeZePQOjuMmiAAAA",
    "credit": {
      "author": "hds",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Forest_in_Cuc_Phuong_National_Park_(15706323528).jpg"
    }
  },
  "roots": {
    "id": "trip/roots",
    "title": "Rễ bành cây cổ thụ tại rừng nhiệt đới VQG Cát Tiên, Đồng Nai",
    "region": "Nam và Đông Nam Á",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Hệ rễ bành lớn của cây cổ thụ trên nền rừng mưa nhiệt đới đất thấp tại Vườn quốc gia Cát Tiên, Việt Nam.",
    "sources": {
      "avif": [
        {
          "src": "trip/roots-960.avif",
          "width": 960
        },
        {
          "src": "trip/roots-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/roots-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/roots-960.webp",
          "width": 960
        },
        {
          "src": "trip/roots-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/roots-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/roots.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/roots.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoQAAwAA8BgJYwAAhd/fc3UAAD+49M2Zj6cGDM0OkfLWQdWMIqEMh1XIegKYtjMwRSpeD70X/LGqQLEsy+3R4AA",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cat_Tien_Park,_Vietnam,_tropical_forest,_roots.jpg"
    }
  },
  "python": {
    "id": "trip/python",
    "title": "Trăn đất hoang dã tại Vườn quốc gia Bardiya, Nepal",
    "scientificName": "Python bivittatus",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Góc chụp nghiêng phần đầu của trăn đất Python bivittatus đang tựa trên cành cây xanh tại Vườn quốc gia Bardiya, Nepal.",
    "sources": {
      "avif": [
        {
          "src": "trip/python-960.avif",
          "width": 960
        },
        {
          "src": "trip/python-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/python-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/python-960.webp",
          "width": 960
        },
        {
          "src": "trip/python-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/python-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/python.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/python.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJagCdACz1hIeVpAA/vW9yugXQzGcHJcU2YFIZK3hodGURIOXjmMmzCrAzA65WIkq06W5Rc9fMZU5qKm/ycYcqcdAvNlj1WATk8nIAAA=",
    "credit": {
      "author": "Shadow Ayush",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_photographed_at_Bardiya_National_Park2.jpg"
    }
  },
  "boat": {
    "id": "trip/boat",
    "title": "Ngã ba sông Tembeling và sông Jelai ở Kuala Tembeling, Pahang, Malaysia",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.7778,
    "focus": "50% 50%",
    "alt": "Sông Tembeling gặp sông Jelai ở Kuala Tembeling, bến thuyền vào Vườn quốc gia Taman Negara; rừng mưa phủ hai bên bờ dưới trời xanh.",
    "sources": {
      "avif": [
        {
          "src": "trip/boat-960.avif",
          "width": 960
        },
        {
          "src": "trip/boat-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/boat-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/boat-960.webp",
          "width": 960
        },
        {
          "src": "trip/boat-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/boat-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/boat.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/boat.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAACwAQCdASoQAAkABABoJZgCdADVjGYAAP60JWVU6J7X7bBabLXbUPwKWn3qu6p2JANHpHfpWw99pjdHMAN14x2HcjXw3y8fiQAAAA==",
    "credit": {
      "author": "Slleong",
      "license": "CC0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kuala_Tembeling_3.jpg"
    }
  },
  "walkway": {
    "id": "trip/walkway",
    "title": "Cầu treo xuyên tán rừng mưa VQG Taman Negara, Pahang, Malaysia",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cầu treo bằng dây thừng và ván gỗ đi xuyên qua tầng tán rừng mưa nhiệt đới tại Vườn quốc gia Taman Negara, bang Pahang, Malaysia.",
    "sources": {
      "avif": [
        {
          "src": "trip/walkway-960.avif",
          "width": 960
        },
        {
          "src": "trip/walkway-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/walkway-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/walkway-960.webp",
          "width": 960
        },
        {
          "src": "trip/walkway-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/walkway-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/walkway.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/walkway.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACQAQCdASoQAAwAA8BgJYwAAoTJTAAA/tHs7S0Jpl0gJ/MAh7Ev1rkVBhwVnnegGDMnIhKxgd9lT5hK1Gh3vGNP4hF9dmpfww4dhcvfUuaCePwAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Taman_Negara,_Malaysia,_Canopy_Walkway.jpg"
    }
  },
  "swamp": {
    "id": "trip/swamp",
    "title": "Rừng đầm lầy than bùn ngập nước tại Borneo",
    "region": "Borneo, Sumatra và Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Những thân cây thẳng có gốc bành đứng giữa mặt nước sẫm màu trong khu rừng đầm lầy than bùn đất thấp tại Borneo.",
    "sources": {
      "avif": [
        {
          "src": "trip/swamp-960.avif",
          "width": 960
        },
        {
          "src": "trip/swamp-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/swamp-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/swamp-960.webp",
          "width": 960
        },
        {
          "src": "trip/swamp-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/swamp-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/swamp.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/swamp.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAQCdASoQAAwAA8BgJQBYdhJoZfggAN2qqA5HmnAgS4fEyLrxPw+YkCN5tRGNAvIUnxlkZ2Z3wq2G4GVI4hhtVLK2oZgvEksa4eaQfLwtaIgA",
    "credit": {
      "author": "shankar s. from Dubai, united arab emirates",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_view_of_the_old_rainforest-_not_much_left_unfortunately_(11463945203).jpg"
    }
  },
  "ampullaria": {
    "id": "trip/ampullaria",
    "title": "Cụm lá sát đất và ấm tròn của Nắp ấm Ampullaria",
    "scientificName": "Nepenthes ampullaria",
    "role": "biome",
    "width": 1920,
    "height": 1271,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Cụm lá non xanh bóng mọc sát mặt đất bao quanh bởi những chiếc bình ấm tròn màu xanh lục của loài Nepenthes ampullaria trên nền rêu và lá khô.",
    "sources": {
      "avif": [
        {
          "src": "trip/ampullaria-960.avif",
          "width": 960
        },
        {
          "src": "trip/ampullaria-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/ampullaria-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/ampullaria-960.webp",
          "width": 960
        },
        {
          "src": "trip/ampullaria-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/ampullaria-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/ampullaria.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/ampullaria.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAwAA8BgJQBOgCPUpxLJQAD+zDL+ZC8h+uv4eafMOhUYuHx6e5B4eGL1ToAHFvbTPUvtN67AAFqfl/sCbiMYOz3EgDr3AAA=",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pitcher_Plant_(Nepenthes_ampullaria)_(14136485484).jpg"
    }
  },
  "summit": {
    "id": "trip/summit",
    "title": "Mây mù trên rừng mưa sườn núi Kinabalu, Sabah, Borneo",
    "region": "Núi Kinabalu, Sabah, Borneo",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Mây mù dày đặc hình thành trên tầng tán rừng mưa núi cao tại Kundasang, sườn núi Kinabalu, Sabah, Borneo.",
    "sources": {
      "avif": [
        {
          "src": "trip/summit-960.avif",
          "width": 960
        },
        {
          "src": "trip/summit-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/summit-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/summit-960.webp",
          "width": 960
        },
        {
          "src": "trip/summit-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/summit-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/summit.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/summit.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADwAQCdASoQAAwAA8BgJQBOgCPZxGxHQAAA/lvtCVcLsRjZddvU9ud+hFHdQn6npV4aQY8Ro//BKwHj5EfTkQRDHjgAAA==",
    "credit": {
      "author": "kallerna",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rainforest_cloud_forming_Kinabalu_Sabah_Borneo_Kampong_Kundasang_5.jpg"
    }
  },
  "ferns": {
    "id": "trip/ferns",
    "title": "Tán dương xỉ thân gỗ giữa rừng mây núi cao",
    "region": "Rừng mây nhiệt đới",
    "role": "biome",
    "width": 1920,
    "height": 1262,
    "aspectRatio": 1.52,
    "focus": "50% 50%",
    "alt": "Những vòm lá dương xỉ thân gỗ Cyathea xanh mướt nổi bật trước sườn rừng núi cao phủ đầy mây mù.",
    "sources": {
      "avif": [
        {
          "src": "trip/ferns-960.avif",
          "width": 960
        },
        {
          "src": "trip/ferns-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/ferns-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/ferns-960.webp",
          "width": 960
        },
        {
          "src": "trip/ferns-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/ferns-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/ferns.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/ferns.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAwAA8BgJYgCdAELLK8YaAAA/uhRsQ7ItAMI5hLI5CMBV//PYax7ECy1h6FRxQ4pEtzCZZetnX1jWPVNZRSJa+jDjjVdAAA=",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tree_Ferns_(Cyathea_sp.)_and_Montane_Forest_(14647918801).jpg"
    }
  },
  "rajah": {
    "id": "trip/rajah",
    "title": "Ấm dưới khổng lồ của Nắp ấm Rajah ngoài tự nhiên",
    "scientificName": "Nepenthes rajah",
    "role": "biome",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "50% 50%",
    "alt": "Bình ấm dưới cỡ lớn màu đỏ tía của loài Nepenthes rajah nằm trên thảm thực vật rừng núi Kinabalu, Borneo.",
    "sources": {
      "avif": [
        {
          "src": "trip/rajah-960.avif",
          "width": 960
        },
        {
          "src": "trip/rajah-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/rajah-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/rajah-960.webp",
          "width": 960
        },
        {
          "src": "trip/rajah-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/rajah-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/rajah.webp",
          "width": 1488
        }
      ],
      "jpg": "trip/rajah.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAQCdASoQAAwAA8BgJbACdAC4OJzWvGgA/u8fOM15HGqShogZ6WclXQ+WAEK/tOe9hTSwC7qRHdIWoPNdvhPN1gvJTLRi3jjzcKaSnZBkNTRlEE58THbwVLQ517qspuwaUAAA",
    "credit": {
      "author": "NepGrower (người tải lên)",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Large_lower_pitcher_of_wild_Nepenthes_rajah_plant.jpg"
    }
  },
  "carolina": {
    "id": "trip/carolina",
    "title": "Thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, Hoa Kỳ",
    "region": "Duyên hải Bắc và Nam Carolina, Hoa Kỳ",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Rừng thông lá dài thưa tán với thảm cỏ ẩm dưới nắng tại vùng duyên hải Bắc Carolina, Hoa Kỳ.",
    "sources": {
      "avif": [
        {
          "src": "trip/carolina-960.avif",
          "width": 960
        },
        {
          "src": "trip/carolina-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/carolina-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/carolina-960.webp",
          "width": 960
        },
        {
          "src": "trip/carolina-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/carolina-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/carolina.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/carolina.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAACQAQCdASoQAAwAA8BgJYgCdAB/hEgA/t37ELC49FJnx1GEb7OA6VYycyYJToTfj4jTfc3/MRfQ/KfYPuB8IEIryvBME/faMbQYPSfYcshsG/XihJAAAA==",
    "credit": {
      "author": "Justin Meissen from St Paul, United States",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Longleaf_Pine_Savanna_II_(13158080455).jpg"
    }
  },
  "venus2": {
    "id": "trip/venus2",
    "title": "Cụm Cây bắt ruồi Venus ngoài tự nhiên tại Green Swamp, Bắc Carolina",
    "scientificName": "Dionaea muscipula",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cụm cây bắt ruồi Dionaea muscipula với các lá bẫy xanh tươi và lòng hồng đỏ đang bắt côn trùng tại khu bảo tồn Green Swamp, Bắc Carolina.",
    "sources": {
      "avif": [
        {
          "src": "trip/venus2-960.avif",
          "width": 960
        },
        {
          "src": "trip/venus2-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/venus2-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/venus2-960.webp",
          "width": 960
        },
        {
          "src": "trip/venus2-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/venus2-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/venus2.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/venus2.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQAAwAA8BgJbACdAD8p+bYvV3YAM3P4dvbACO0K9nrYRct5Dm6BBflBcHrA+cF97rsXGiaEmaEdh607kq2u0TT4EAWEVwnu/yut/ZHnluCLUE5AAA=",
    "credit": {
      "author": "Judy Gallagher",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_Flytrap_-_Dionaea_muscipula,_Green_Swamp,_Supply,_North_Carolina,_October_18,_2021_(51693075042).jpg"
    }
  },
  "xochi": {
    "id": "trip/xochi",
    "title": "Kênh đào sinh thái và thuyền gỗ hồ Xochimilco, Mexico City",
    "region": "Hồ Xochimilco, Mexico",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Những chiếc thuyền gỗ truyền thống đầy màu sắc trên kênh đào hồ Xochimilco tại Mexico City — nơi cư ngụ tự nhiên của kỳ giông Axolotl.",
    "sources": {
      "avif": [
        {
          "src": "trip/xochi-960.avif",
          "width": 960
        },
        {
          "src": "trip/xochi-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/xochi-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/xochi-960.webp",
          "width": 960
        },
        {
          "src": "trip/xochi-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/xochi-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/xochi.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/xochi.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJZQCdADbYFRY+gAA/rxYljdyq4DHR9eXzarxsNgiErvG3dD6y9xjIiWGaLjcc5LRY2IwTuIVvSC5rB/DEVRiV/LPL0sQ6IYz7ZEAAAA=",
    "credit": {
      "author": "El Comandante",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Trajineras_(Xochimilco,_2009).JPG"
    }
  },
  "axolotl": {
    "id": "trip/axolotl",
    "title": "Kỳ giông Axolotl màu tự nhiên tại thủy cung Aquarium Finisterrae",
    "scientificName": "Ambystoma mexicanum",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Kỳ giông Axolotl màu xám xanh đốm đen tự nhiên với ba cặp mang ngoài dạng lông vũ đang nằm trên nền sỏi dưới nước.",
    "sources": {
      "avif": [
        {
          "src": "trip/axolotl-960.avif",
          "width": 960
        },
        {
          "src": "trip/axolotl-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/axolotl-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/axolotl-960.webp",
          "width": 960
        },
        {
          "src": "trip/axolotl-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/axolotl-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/axolotl.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/axolotl.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAwAA8BgJQBOgCDcWmrOBAAA/trTJL39AtClz6p8WkihXu8QaTTbNqHHhADzuAGOxSLeYDXZ2BHB9B3W4jW6lTwp7qAAr4elnUEfkRFBEY/gAAA=",
    "credit": {
      "author": "Fernando Losada Rodríguez",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum.005_-_Aquarium_Finisterrae.jpg"
    }
  },
  "ghana": {
    "id": "trip/ghana",
    "title": "Cảnh quan thảo nguyên Savan tại miền Bắc Ghana, Tây Phi",
    "region": "Thảo nguyên Tây và Trung Phi",
    "role": "biome",
    "width": 1920,
    "height": 1370,
    "aspectRatio": 1.4,
    "focus": "50% 50%",
    "alt": "Cảnh quan thảo nguyên savan xanh mát điểm cây gỗ thưa và đàn voi châu Phi tại khu vực miền Bắc Ghana, Tây Phi.",
    "sources": {
      "avif": [
        {
          "src": "trip/ghana-960.avif",
          "width": 960
        },
        {
          "src": "trip/ghana-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/ghana-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/ghana-960.webp",
          "width": 960
        },
        {
          "src": "trip/ghana-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/ghana-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/ghana.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/ghana.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACwAQCdASoQAAwAA8BgJbACdAEMcdXAAP7Qy++xxraEPhtpxD4rBKXgRR20NTuav1bfaOqYq8vhFlGci+KbjMIj+TLeDMgA",
    "credit": {
      "author": "Stig Nygaard",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Savanna_landscape,_Northern_region,_Ghana.jpg"
    }
  },
  "ballpython": {
    "id": "trip/ballpython",
    "title": "Cận cảnh đầu và cổ Trăn bóng hoang dã (Python regius)",
    "scientificName": "Python regius",
    "role": "biome",
    "width": 1920,
    "height": 1201,
    "aspectRatio": 1.6,
    "focus": "50% 50%",
    "alt": "Cận cảnh phần đầu và cổ của cá thể trăn bóng Python regius màu tự nhiên nâu đen điểm vệt vàng đồng trên nền vỏ cây.",
    "sources": {
      "avif": [
        {
          "src": "trip/ballpython-960.avif",
          "width": 960
        },
        {
          "src": "trip/ballpython-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/ballpython-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/ballpython-960.webp",
          "width": 960
        },
        {
          "src": "trip/ballpython-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/ballpython-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/ballpython.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/ballpython.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAwAA8BgJaACdAYtVgSXycAA4lC05QCX9uvzCYlhMbNSgUS6T/6x6zSdcx5Mn0K0/cYajKTrRHYnRZhycmJLHG/HcGzAwsUBPvP2gAA=",
    "credit": {
      "author": "Brian Gratwicke",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_-_ball_python.jpg"
    }
  },
  "baloch": {
    "id": "trip/baloch",
    "title": "Sườn núi đá khô hạn lúc hoàng hôn tại Turbat, Balochistan, Pakistan",
    "region": "Pakistan, Afghanistan và Tây Bắc Ấn Độ",
    "role": "biome",
    "width": 1920,
    "height": 1098,
    "aspectRatio": 1.75,
    "focus": "50% 50%",
    "alt": "Dãy núi đá trầm tích khô cằn và thảm cây bụi thưa dưới ánh hoàng hôn tại Turbat, tỉnh Balochistan, Pakistan.",
    "sources": {
      "avif": [
        {
          "src": "trip/baloch-960.avif",
          "width": 960
        },
        {
          "src": "trip/baloch-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/baloch-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/baloch-960.webp",
          "width": 960
        },
        {
          "src": "trip/baloch-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/baloch-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/baloch.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/baloch.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoQAAwAA8BgJZgCdAEOwCdlQAD+yOlca4/x7+hVovor1dn7DvK1CNO6tHlQSf8sl/fYAAAA",
    "credit": {
      "author": "Yasir Dora",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sunset_in_mountains,_Turbat,_Balochistan.jpg"
    }
  },
  "gecko": {
    "id": "trip/gecko",
    "title": "Thằn lằn da báo hoang dã trên nền cát (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "biome",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo Eublepharis macularius với các dải màu xám nâu sẫm xen kẽ nền kem nhạt và đốm đen sần hạt trên cát.",
    "sources": {
      "avif": [
        {
          "src": "trip/gecko-960.avif",
          "width": 960
        },
        {
          "src": "trip/gecko-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/gecko-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/gecko-960.webp",
          "width": 960
        },
        {
          "src": "trip/gecko-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/gecko-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/gecko.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/gecko.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoQAAwAA8BgJaACdAEP/wy78jkAAP5WpNJHOQOE+rogAuNT4+l0+p1PXnqkRTlGs8oQAjpRZoq9Ly2xSQW6+jiop8rgAA==",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eublepharis_macularius_2009_G6.jpg"
    }
  },
  "uluru": {
    "id": "trip/uluru",
    "title": "Bán hoang mạc đất đỏ tại VQG Uluru-Kata Tjuta, miền Trung nước Úc",
    "region": "Miền Trung nước Úc",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Khối đá sa thạch đỏ Uluru vươn cao trên thảm cỏ khô và cây gỗ thưa tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.",
    "sources": {
      "avif": [
        {
          "src": "trip/uluru-960.avif",
          "width": 960
        },
        {
          "src": "trip/uluru-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/uluru-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/uluru-960.webp",
          "width": 960
        },
        {
          "src": "trip/uluru-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/uluru-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/uluru.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/uluru.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAwAA8BgJbACdAD0E6kybAAA/nye9N+dmvzBmnfpMUHxDKOoFAdy6IEWE3STXlOGn5E3fyJxeVn3RY29G18lKIAAAA==",
    "credit": {
      "author": "Dietmar Rabich",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Petermann_Ranges_(AU),_Uluru-Kata_Tjuta_National_Park,_Uluru,_Kuniya_Walk_--_2019_--_3615.jpg"
    }
  },
  "dragon": {
    "id": "trip/dragon",
    "title": "Rồng Úc phơi nắng trên nền cát (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "biome",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Cá thể Rồng Úc Pogona vitticeps màu vàng cát đang nằm phơi nắng trên nền cát mịn, lộ rõ hàng vảy gai chạy dọc hai bên sườn.",
    "sources": {
      "avif": [
        {
          "src": "trip/dragon-960.avif",
          "width": 960
        },
        {
          "src": "trip/dragon-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/dragon-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/dragon-960.webp",
          "width": 960
        },
        {
          "src": "trip/dragon-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/dragon-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/dragon.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/dragon.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAgCdASoQAAwAA8BgJaACdAEWPbZrwIAAAOAT7k3/CprOTtu1/a0l13NFNdp91Yp5Ck9e5apShsoBgQAAAA==",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_close-up_2009_G1.jpg"
    }
  },
  "maquis": {
    "id": "trip/maquis",
    "title": "Thảm thực vật cây bụi Maquis tại dãy Massif des Maures, miền Nam nước Pháp",
    "region": "Nam Âu — Địa Trung Hải",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Sườn đồi phủ thảm cây bụi Maquis và hoa thạch nam trắng tại dãy Massif des Maures, vùng Provence, miền Nam nước Pháp.",
    "sources": {
      "avif": [
        {
          "src": "trip/maquis-960.avif",
          "width": 960
        },
        {
          "src": "trip/maquis-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/maquis-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/maquis-960.webp",
          "width": 960
        },
        {
          "src": "trip/maquis-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/maquis-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/maquis.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/maquis.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAwAA8BgJQBOgCKqxwuy6AD+6uU7CjQf/dr6AOce68XBMbstvJqfVAOMKJU7980erWnqxj0AAA==",
    "credit": {
      "author": "AmélieBertaigne",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Formation_maquis.jpg"
    }
  },
  "hermann": {
    "id": "trip/hermann",
    "title": "Rùa Hermann bước đi trên thảm cỏ hoa cúc trắng (Testudo hermanni)",
    "scientificName": "Testudo hermanni",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể rùa cạn Testudo hermanni với chiếc mai vòm màu vàng rơm đốm đen đang bước đi giữa thảm cỏ xanh và hoa cúc trắng.",
    "sources": {
      "avif": [
        {
          "src": "trip/hermann-960.avif",
          "width": 960
        },
        {
          "src": "trip/hermann-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/hermann-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/hermann-960.webp",
          "width": 960
        },
        {
          "src": "trip/hermann-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/hermann-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/hermann.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/hermann.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJZgC7AC3W2OkIgAA/u6kdWwUp4OwxUqG8phh9AvsntaytkV2uZiVSlr+RkySFHTroJJ48tBPh05a4uWMWHh6GwAAAA==",
    "credit": {
      "author": "NorbertNagel",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_Boettgeri_-_01.jpg"
    }
  },
  "calanque": {
    "id": "trip/calanque",
    "title": "Rừng thông ven biển Địa Trung Hải tại vịnh Calanque de Port-Pin, Cassis, Pháp",
    "region": "Nam Âu — Địa Trung Hải",
    "role": "biome",
    "width": 1920,
    "height": 1152,
    "aspectRatio": 1.67,
    "focus": "50% 50%",
    "alt": "Lối mòn đá vôi dưới tán rừng thông Aleppo dẫn ra làn nước biển xanh biếc tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp.",
    "sources": {
      "avif": [
        {
          "src": "trip/calanque-960.avif",
          "width": 960
        },
        {
          "src": "trip/calanque-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/calanque-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/calanque-960.webp",
          "width": 960
        },
        {
          "src": "trip/calanque-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/calanque-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/calanque.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/calanque.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAQCdASoQAAwAA8BgJZwAAlZHq/W3AAD+5sH7yITaIJMRBJ6ldM7oxDsTyzM0fB710In3Dw7h4jy9f/iSLtJ1mCdmY64Ycgf/9Bh5a5qZMkfAdNFUcAAA",
    "credit": {
      "author": "Cocosea",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Calanque_de_Cassis.jpg"
    }
  },
  "rajah2": {
    "id": "trip/rajah2",
    "title": "Cây Nắp ấm Rajah non với tán lá xanh và bình đỏ tía",
    "scientificName": "Nepenthes rajah",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cây Nepenthes rajah kích thước nhỏ với cụm lá xanh bóng sát đất và một bình ấm màu đỏ tía đang phát triển.",
    "sources": {
      "avif": [
        {
          "src": "trip/rajah2-960.avif",
          "width": 960
        },
        {
          "src": "trip/rajah2-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/rajah2-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/rajah2-960.webp",
          "width": 960
        },
        {
          "src": "trip/rajah2-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/rajah2-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/rajah2.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/rajah2.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAwAA8BgJZgCdADOg73KBy4AAM3TWoeffR8c7DlvGg6qmOMhhTdpkPGw3gD/ednQCkjw2SW9nYvnGPohT2jVrt2XhHE1ExfTqpGqPFFcwAAA",
    "credit": {
      "author": "NepGrower at English Wikipedia",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_rajah_(5).jpg"
    }
  },
  "ampullaria2": {
    "id": "trip/ampullaria2",
    "title": "Thảm ấm đất của Nắp ấm Ampullaria hứng lá mục dưới tán rừng",
    "scientificName": "Nepenthes ampullaria",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Quần thể hàng chục bình ấm Nepenthes ampullaria mọc chen chúc giữa lớp rêu và cành lá khô rụng trên nền rừng.",
    "sources": {
      "avif": [
        {
          "src": "trip/ampullaria2-960.avif",
          "width": 960
        },
        {
          "src": "trip/ampullaria2-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/ampullaria2-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/ampullaria2-960.webp",
          "width": 960
        },
        {
          "src": "trip/ampullaria2-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/ampullaria2-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/ampullaria2.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/ampullaria2.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADQAQCdASoQAAwAA8BgJbAC7ADp/bssQAD+7q3RMLQRLssmz6OZK4odQUdzGxXGjr2+lQuw1cazpgKoxKlLbHzdm7EbXJvQYwPhRnlbY6ppQEwlje+t+dCwEBezSgAA",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pitcher_Plants_(Nepenthes_ampullaria)_(8410326499).jpg"
    }
  },
  "axolotl2": {
    "id": "trip/axolotl2",
    "title": "Kỳ giông Axolotl dòng Leucistic trắng hồng với mang ngoài đỏ tươi",
    "scientificName": "Ambystoma mexicanum",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể kỳ giông Axolotl đột biến Leucistic thân trắng hồng nhạt với ba cặp mang ngoài màu đỏ hồng nổi bật.",
    "sources": {
      "avif": [
        {
          "src": "trip/axolotl2-960.avif",
          "width": 960
        },
        {
          "src": "trip/axolotl2-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/axolotl2-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/axolotl2-960.webp",
          "width": 960
        },
        {
          "src": "trip/axolotl2-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/axolotl2-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/axolotl2.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/axolotl2.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJQBOgBuyaclh/gAA/vD78wlsSEfF4IdJUC+VuPImkHgKOPJEsrdVkAtcbVd6palnMVfsWcuO3VHyDUB4InnCG+AAAA==",
    "credit": {
      "author": "Amandasofiarana",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Axolotl_ambystoma_mexicanum_anfibio_ASAG.jpg"
    }
  },
  "gecko2": {
    "id": "trip/gecko2",
    "title": "Cận cảnh đầu, mí mắt động và đồng tử dọc của Thằn lằn da báo",
    "scientificName": "Eublepharis macularius",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Ảnh chụp cận cảnh phần đầu thằn lằn da báo màu vàng tươi đốm đen, thấy rõ mí mắt có thể nhắm mở và đồng tử dọc.",
    "sources": {
      "avif": [
        {
          "src": "trip/gecko2-960.avif",
          "width": 960
        },
        {
          "src": "trip/gecko2-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/gecko2-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/gecko2-960.webp",
          "width": 960
        },
        {
          "src": "trip/gecko2-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/gecko2-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/gecko2.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/gecko2.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAwAgCdASoQAAwAA8BgJagCdAYtpyc+9+gaiAD+sgYFJ/6ziiEUhN7FI1trCQaL9XgfV5rtVPvrs+0MZeeYe50hnfFOpKer0/4mDzZ5HKl4zDQAAAA=",
    "credit": {
      "author": "Christian von Faber-Castell",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:EUBLEPHARIS-MACULARIUS_Leopard-Gecko_Leopardgecko_201705276011.jpg"
    }
  },
  "venus": {
    "id": "trip/venus",
    "title": "Hai thùy lá bẫy và hàng gai viền của Cây bắt ruồi Venus",
    "scientificName": "Dionaea muscipula",
    "role": "biome",
    "width": 1920,
    "height": 1920,
    "aspectRatio": 1,
    "focus": "50% 50%",
    "alt": "Cận cảnh hai chiếc bẫy lá Dionaea muscipula màu xanh viền gai răng lược và lòng bẫy ánh hồng giữa lớp lá thông khô.",
    "sources": {
      "avif": [
        {
          "src": "trip/venus-960.avif",
          "width": 960
        },
        {
          "src": "trip/venus-1600.avif",
          "width": 1600
        },
        {
          "src": "trip/venus-1920.avif",
          "width": 1920
        }
      ],
      "webp": [
        {
          "src": "trip/venus-960.webp",
          "width": 960
        },
        {
          "src": "trip/venus-1600.webp",
          "width": 1600
        },
        {
          "src": "trip/venus-1920.webp",
          "width": 1920
        },
        {
          "src": "trip/venus.webp",
          "width": 1920
        }
      ],
      "jpg": "trip/venus.webp"
    },
    "placeholder": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAwAgCdASoQAAwAA8BgJagCdAYvDayGsHTusAD+71MGXogHa5c4i4vzEcGtIeeiyTB3qh9Kkgfuxwh4tqlV9NPH1pQfExyovMDptzsT1NAnd1LS8BwTpOeWnfNMTl9jy6AAAA==",
    "credit": {
      "author": "Judy Gallagher",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_flytrap_(53886303376).jpg"
    }
  }
};

export type PhotoId = string;

export const PHOTO_LIST: readonly PhotoMetadata[] = Object.values(PHOTOS);

export function getPhoto(id: string): PhotoMetadata | undefined {
  return PHOTOS[id] ?? TRIP_PHOTOS[id.replace(/^trip\//, '')];
}

export function getPhotoById(id: string): PhotoMetadata | undefined {
  return getPhoto(id);
}
