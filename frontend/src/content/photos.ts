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
    "title": "Kỳ giông Axolotl Leucistic (Aquarium Finisterrae)",
    "scientificName": "Ambystoma mexicanum",
    "role": "hero",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "52% 48%",
    "alt": "Kỳ giông Axolotl màu hồng nhạt với ba cặp mang ngoài dạng lông vũ đỏ tươi dưới làn nước.",
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
    "title": "Chân dung Kỳ giông Axolotl nhìn thẳng",
    "scientificName": "Ambystoma mexicanum",
    "role": "portrait",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Chân dung cận cảnh kỳ giông Axolotl với chùm mang ngoài xòe đối xứng.",
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
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJQBOgBuyaclh/gAA/vD78wlsSEfF4IdJUC+VuPImkHgKOPJEsrdVkAtcbVd6palnMVfsWcuO3VHyDUB4InnCG+AAAA==",
    "credit": {
      "author": "Amandasofiarana",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Axolotl_ambystoma_mexicanum_anfibio_ASAG.jpg"
    }
  },
  "axolotl/habitat-1": {
    "id": "axolotl/habitat-1",
    "title": "Kênh đào sinh thái hồ Xochimilco, Mexico",
    "scientificName": "Ambystoma mexicanum",
    "role": "habitat",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 55%",
    "alt": "Hệ thống kênh đào và thuyền gỗ truyền thống tại hồ Xochimilco, Mexico City — nơi cư ngụ tự nhiên duy nhất của Axolotl.",
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
  "nepenthes-rajah/hero-1": {
    "id": "nepenthes-rajah/hero-1",
    "title": "Ấm dưới khổng lồ của Nắp ấm Rajah ngoài tự nhiên",
    "scientificName": "Nepenthes rajah",
    "role": "hero",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "52% 50%",
    "alt": "Bình ấm lớn màu đỏ tía của Nepenthes rajah nằm trên thảm thực vật rừng núi Kinabalu.",
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
    "title": "Cấu trúc vành môi và nắp bình Nepenthes rajah",
    "scientificName": "Nepenthes rajah",
    "role": "portrait",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 48%",
    "alt": "Cận cảnh bình bẫy và vành môi răng cưa màu đỏ sẫm của loài Nắp ấm khổng lồ Rajah.",
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
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAwAA8BgJZgCdADOg73KBy4AAM3TWoeffR8c7DlvGg6qmOMhhTdpkPGw3gD/ednQCkjw2SW9nYvnGPohT2jVrt2XhHE1ExfTqpGqPFFcwAAA",
    "credit": {
      "author": "NepGrower at English Wikipedia",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_rajah_(5).jpg"
    }
  },
  "nepenthes-rajah/habitat-1": {
    "id": "nepenthes-rajah/habitat-1",
    "title": "Rừng mây sườn núi Kinabalu, Sabah, Borneo",
    "scientificName": "Nepenthes rajah",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Mây mù hình thành trên rừng mưa núi cao Kinabalu tại Kundasang, Sabah, Borneo.",
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
  "ball-python/hero-1": {
    "id": "ball-python/hero-1",
    "title": "Trăn bóng hoang dã (Python regius)",
    "scientificName": "Python regius",
    "role": "hero",
    "width": 1920,
    "height": 1201,
    "aspectRatio": 1.6,
    "focus": "50% 50%",
    "alt": "Trăn bóng Python regius với hoa văn nâu đen và vàng đồng đặc trưng.",
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
    "title": "Trăn bóng ẩn mình giữa kẽ vỏ cây",
    "scientificName": "Python regius",
    "role": "portrait",
    "width": 1848,
    "height": 1626,
    "aspectRatio": 1.14,
    "focus": "50% 48%",
    "alt": "Cá thể trăn bóng Python regius cuộn thân giữa các lớp vỏ cây khô.",
    "sources": {
      "avif": [
        {
          "src": "photos/ball-python/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/ball-python/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/ball-python/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAQCdASoQAAwAA8BgJYwCdAC7+q4AAP7AZxc7U027tMlx981x8gvEO0kX3GneOW73TyhGfjBspJ7rIApj9cqm63wqjIAAAAA=",
    "credit": {
      "author": "Rainer Altenkamp",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_070731_a.jpg"
    }
  },
  "ball-python/habitat-1": {
    "id": "ball-python/habitat-1",
    "title": "Thảo nguyên Savan miền Bắc Ghana",
    "scientificName": "Python regius",
    "role": "habitat",
    "width": 1920,
    "height": 1370,
    "aspectRatio": 1.4,
    "focus": "50% 50%",
    "alt": "Cảnh quan đồng cỏ savan điểm cây bụi tại khu vực miền Bắc Ghana, Tây Phi.",
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
  "leopard-gecko/hero-1": {
    "id": "leopard-gecko/hero-1",
    "title": "Thằn lằn da báo (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "hero",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "52% 48%",
    "alt": "Thằn lằn da báo Eublepharis macularius với lớp da vàng đốm đen sần hạt đặc trưng.",
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
    "title": "Cận cảnh đầu và mí mắt Thằn lằn da báo",
    "scientificName": "Eublepharis macularius",
    "role": "portrait",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 45%",
    "alt": "Góc chụp cận cảnh đầu thằn lằn da báo cho thấy rõ mí mắt động và đồng tử dọc.",
    "sources": {
      "avif": [
        {
          "src": "photos/leopard-gecko/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
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
    "title": "Hoàng hôn trên dãy núi đá Turbat, Balochistan",
    "scientificName": "Eublepharis macularius",
    "role": "habitat",
    "width": 1920,
    "height": 1098,
    "aspectRatio": 1.75,
    "focus": "50% 55%",
    "alt": "Địa hình núi đá bán hoang mạc lúc hoàng hôn tại Turbat, Balochistan — sinh cảnh bản địa của thằn lằn da báo.",
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
  "venus-flytrap/hero-1": {
    "id": "venus-flytrap/hero-1",
    "title": "Cây bắt ruồi Venus tại khu bảo tồn Green Swamp",
    "scientificName": "Dionaea muscipula",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Lá bẫy đỏ rực của cây bắt ruồi Dionaea muscipula chụp ngoài tự nhiên tại Green Swamp, Bắc Carolina.",
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
    "title": "Thùy lá và gai viền bẫy Cây bắt ruồi Venus",
    "scientificName": "Dionaea muscipula",
    "role": "portrait",
    "width": 1920,
    "height": 1920,
    "aspectRatio": 1,
    "focus": "50% 48%",
    "alt": "Cận cảnh hai thùy lá bẫy mở rộng với hàng gai răng lược của cây bắt ruồi Venus.",
    "sources": {
      "avif": [
        {
          "src": "photos/venus-flytrap/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/venus-flytrap/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/venus-flytrap/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAwAgCdASoQAAwAA8BgJagCdAYvDayGsHTusAD+71MGXogHa5c4i4vzEcGtIeeiyTB3qh9Kkgfuxwh4tqlV9NPH1pQfExyovMDptzsT1NAnd1LS8BwTpOeWnfNMTl9jy6AAAA==",
    "credit": {
      "author": "Judy Gallagher",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_flytrap_(53886303376).jpg"
    }
  },
  "venus-flytrap/habitat-1": {
    "id": "venus-flytrap/habitat-1",
    "title": "Thảo nguyên thông lá dài Bắc Carolina",
    "scientificName": "Dionaea muscipula",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Hệ sinh thái thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, nơi cây bắt ruồi Venus sinh trưởng.",
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
  "burmese-python/hero-1": {
    "id": "burmese-python/hero-1",
    "title": "Trăn đất ngoài tự nhiên tại VQG Bardiya",
    "scientificName": "Python bivittatus",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "52% 50%",
    "alt": "Trăn đất Python bivittatus với hoa văn nâu viền vàng đặc trưng nằm trên nền rừng.",
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
    "title": "Cận cảnh đầu Trăn đất với vân mũi tên",
    "scientificName": "Python bivittatus",
    "role": "portrait",
    "width": 1600,
    "height": 1200,
    "aspectRatio": 1.33,
    "focus": "50% 45%",
    "alt": "Cận cảnh phần đầu trăn đất Python bivittatus thể hiện rõ hoa văn mũi tên trên đỉnh đầu.",
    "sources": {
      "avif": [
        {
          "src": "photos/burmese-python/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/burmese-python/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/burmese-python/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAwAA8BgJQBOgCPmqs4AjAAA/vNJZk5QX7fAFXqBb4FHSJGASjv0tN6x4QMRJY1GDn9Zkv/Fpw/YVctsNOB5R0OxeE8Mj1gAAA==",
    "credit": {
      "author": "SuperJew",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_03.jpg"
    }
  },
  "burmese-python/habitat-1": {
    "id": "burmese-python/habitat-1",
    "title": "Rễ cây cổ thụ rừng nhiệt đới VQG Cát Tiên, Việt Nam",
    "scientificName": "Python bivittatus",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Hệ rễ cây cổ thụ đan xen trên nền rừng mưa nhiệt đới tại Vườn quốc gia Cát Tiên, Việt Nam.",
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
  "bearded-dragon/hero-1": {
    "id": "bearded-dragon/hero-1",
    "title": "Chân dung Rồng Úc (Pogona vitticeps)",
    "scientificName": "Pogona vitticeps",
    "role": "hero",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 45%",
    "alt": "Cận cảnh đầu và hàng vảy gai cổ họng của Rồng Úc Pogona vitticeps.",
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
    "title": "Hình thái toàn thân Rồng Úc trên nền cát",
    "scientificName": "Pogona vitticeps",
    "role": "portrait",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Góc nhìn từ trên xuống toàn thân Rồng Úc Pogona vitticeps phơi nắng trên nền cát.",
    "sources": {
      "avif": [
        {
          "src": "photos/bearded-dragon/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/bearded-dragon/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/bearded-dragon/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAwAA8BgJZgCdACZcTPegABpC1JOrse3nX21/+VMEJFCeuL2O+ipWk0iQAAA",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_2009_G1.jpg"
    }
  },
  "bearded-dragon/habitat-1": {
    "id": "bearded-dragon/habitat-1",
    "title": "Bán hoang mạc đất đỏ VQG Uluru-Kata Tjuta, Trung Úc",
    "scientificName": "Pogona vitticeps",
    "role": "habitat",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Khối đá sa thạch đỏ và thảm cây bụi khô hạn tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.",
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
  "hermann-tortoise/hero-1": {
    "id": "hermann-tortoise/hero-1",
    "title": "Rùa Hermann phân loài phương Đông (Testudo hermanni boettgeri)",
    "scientificName": "Testudo hermanni",
    "role": "hero",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 52%",
    "alt": "Rùa cạn Hermann với chiếc mai vòm màu vàng rơm điểm các mảng đen rõ nét.",
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
    "title": "Cận cảnh Rùa Hermann phương Tây (Testudo hermanni hermanni)",
    "scientificName": "Testudo hermanni",
    "role": "portrait",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cận cảnh đầu và mai trước của rùa Hermann giữa thảm cỏ khô Địa Trung Hải.",
    "sources": {
      "avif": [
        {
          "src": "photos/hermann-tortoise/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/hermann-tortoise/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/hermann-tortoise/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAQCdASoQAAwAA8BgJZgCdADvWxkgAAD+L0ZZDn3neNQ/b0rq8IaEkqQHxi/npBE7eeu7cVQPLn3/EfuSl16LlJg8sfDznsV2gSLCF713+PiiAAA=",
    "credit": {
      "author": "Olaf Tausch",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_hermanni_01.jpg"
    }
  },
  "hermann-tortoise/habitat-1": {
    "id": "hermann-tortoise/habitat-1",
    "title": "Thảm thực vật cây bụi Maquis vùng Địa Trung Hải",
    "scientificName": "Testudo hermanni",
    "role": "habitat",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Sườn đồi đá vôi phủ thảm cây bụi Maquis đặc trưng của vùng ven biển Địa Trung Hải.",
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
  "nepenthes-ampullaria/hero-1": {
    "id": "nepenthes-ampullaria/hero-1",
    "title": "Ấm đất hình cầu của Nắp ấm Ampullaria",
    "scientificName": "Nepenthes ampullaria",
    "role": "hero",
    "width": 1920,
    "height": 1271,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Bình ấm tròn có đốm đỏ và nắp nhỏ ngửa ra sau của loài Nepenthes ampullaria.",
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
    "title": "Thảm ấm Nắp ấm Ampullaria trên nền rừng",
    "scientificName": "Nepenthes ampullaria",
    "role": "portrait",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cụm nhiều bình nắp ấm Nepenthes ampullaria mọc chen chúc trên lớp lá mục.",
    "sources": {
      "avif": [
        {
          "src": "photos/nepenthes-ampullaria/portrait-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/nepenthes-ampullaria/portrait-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/nepenthes-ampullaria/portrait-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADQAQCdASoQAAwAA8BgJbAC7ADp/bssQAD+7q3RMLQRLssmz6OZK4odQUdzGxXGjr2+lQuw1cazpgKoxKlLbHzdm7EbXJvQYwPhRnlbY6ppQEwlje+t+dCwEBezSgAA",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pitcher_Plants_(Nepenthes_ampullaria)_(8410326499).jpg"
    }
  },
  "nepenthes-ampullaria/habitat-1": {
    "id": "nepenthes-ampullaria/habitat-1",
    "title": "Rừng mưa đất thấp ẩm ướt Borneo",
    "scientificName": "Nepenthes ampullaria",
    "role": "habitat",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Khung cảnh rừng mưa nhiệt đới đất thấp nhiều tầng tán và độ ẩm cao.",
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
  "prod-gecko-1": {
    "id": "prod-gecko-1",
    "title": "Thằn lằn da báo săn mồi (Eublepharis macularius)",
    "scientificName": "Eublepharis macularius",
    "role": "product",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo hoa văn đốm rõ nét đang quan sát con mồi.",
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
    "placeholder": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACQAQCdASoQAAwAA8BgJYwAAgPq7gAA/VOw/OJ7LvtZWtP+79TV+YsAxx6Zkf48tT/OX8EHvjBGt7HQNqFBHzyluAAAAA==",
    "credit": {
      "author": "Michał Zawiślak (mihauz @)",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eublepharis_macularius_1.jpg"
    }
  },
  "prod-gecko-2": {
    "id": "prod-gecko-2",
    "title": "Thằn lằn da báo trưởng thành trên nền đá",
    "scientificName": "Eublepharis macularius",
    "role": "product",
    "width": 1920,
    "height": 1437,
    "aspectRatio": 1.34,
    "focus": "50% 50%",
    "alt": "Cá thể thằn lằn da báo khỏe mạnh nằm trên phiến đá trong chuồng nuôi.",
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
    "placeholder": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAQCdASoQAAwAA8BgJQBOgCIIeT2AhAAA/bZn4nszJh4W/4tSyBRSm2FxDhFguvsJ85b+Y8ZyIfPc6oTc2hJxbxPr6g+LlCZZQAAA",
    "credit": {
      "author": "Det at Czech Wikipedia",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:G._no%C4%8Dn%C3%AD.jpg"
    }
  },
  "prod-bearded-dragon-1": {
    "id": "prod-bearded-dragon-1",
    "title": "Rồng Úc Pogona vitticeps góc nhìn lưng",
    "scientificName": "Pogona vitticeps",
    "role": "product",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Cá thể Rồng Úc với hàng gai bên hông và hoa văn lưng rõ nét.",
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
    "placeholder": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAABwAQCdASoQAAwAA8BgJZACdAAAAABMhTPCr4CL/PWROXhunMDUju9cLa5AIq9XlcAAAA==",
    "credit": {
      "author": "George Chernilevsky",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pogona_vitticeps_2009_G2.jpg"
    }
  },
  "prod-ball-python-1": {
    "id": "prod-ball-python-1",
    "title": "Trăn bóng biến thể Hypomelanistic",
    "scientificName": "Python regius",
    "role": "product",
    "width": 1780,
    "height": 1070,
    "aspectRatio": 1.66,
    "focus": "50% 50%",
    "alt": "Cá thể trăn bóng Python regius dòng đột biến giảm sắc tố đen (Hypomelanistic).",
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
    "placeholder": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAABwAgCdASoQAAwAA8BgJYgCdAYt92a3xTIPieAAAP7HcIOMP2CcvwYlNi84Z9OIzFy7dSG1rghfwUfGLwrhSm1XHTsfu9WgQuOovgbJ+C9HlA0oYWETk2wLlJr5ph1RIAA=",
    "credit": {
      "author": "WingedWolfPsion",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Python_regius_-_hypomelanistic.png"
    }
  },
  "prod-burmese-python-1": {
    "id": "prod-burmese-python-1",
    "title": "Trăn đất biến thể Albino vàng trắng",
    "scientificName": "Python bivittatus",
    "role": "product",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cá thể trăn đất Python bivittatus đột biến bạch tạng (Albino) với hoa văn vàng cam và trắng.",
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
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAwAA8BgJbACdAELz6INOyJYAP64OrT9d1eQNozmiH29H0Ehxd25zbwyAYKY/5Pt1VEHwV+dU6sMNX+hXinJia0zpedG5hAAAA==",
    "credit": {
      "author": "Danleo~commonswiki",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Burmese_Python_02.jpg"
    }
  },
  "prod-hermann-tortoise-1": {
    "id": "prod-hermann-tortoise-1",
    "title": "Rùa Hermann mai vàng đen tương phản cao",
    "scientificName": "Testudo hermanni",
    "role": "product",
    "width": 1920,
    "height": 1277,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cá thể rùa cạn Testudo hermanni với các tấm vảy mai bóng khỏe.",
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
    "placeholder": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAQCdASoQAAwAA8BgJQBOgBeRh8ANAAD+flAssVW8EHmo6kL8KeQLh4RXRZyPUW+W29h3wUV3/vn5y9VhQreAeJpRxq7TrZRwmEHxaDrzgAAA",
    "credit": {
      "author": "Jean-Pol GRANDMONT",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Testudo_hermanni_JPG.jpg"
    }
  },
  "prod-axolotl-1": {
    "id": "prod-axolotl-1",
    "title": "Kỳ giông Axolotl màu tự nhiên (Wild-type)",
    "scientificName": "Ambystoma mexicanum",
    "role": "product",
    "width": 1800,
    "height": 794,
    "aspectRatio": 2.27,
    "focus": "50% 50%",
    "alt": "Cá thể kỳ giông Axolotl màu nâu đốm tự nhiên bơi trên nền cát mịn.",
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
    "placeholder": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAwAA8BgJZACdB2gAQtKp7gAAP5OhD+eOZdCl2uAzAI2Sz3XiijZ2+RzA0cnw9u40CY1qnO7HCypNFqPOUmClwSXBE7I5AgAAA==",
    "credit": {
      "author": "Stan Shebs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_2.jpg"
    }
  },
  "prod-venus-flytrap-1": {
    "id": "prod-venus-flytrap-1",
    "title": "Bẫy cây bắt ruồi Venus lòng đỏ thẫm",
    "scientificName": "Dionaea muscipula",
    "role": "product",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cận cảnh chiếc bẫy cây bắt ruồi Dionaea muscipula với mặt trong đỏ thẫm dưới nắng.",
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
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAQCdASoQAAwAA8BgJbACdADxr0UAAP7vkVv7aq1b8sc/gb9u0jX+6A1tqlH8quL9nPbtd0AxnXSutChJpl4pHVSjUe37sXQHX5Fmhhio/4ZRAAA=",
    "credit": {
      "author": "che",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dionaea_muscipula_trap.jpg"
    }
  },
  "prod-nepenthes-rajah-1": {
    "id": "prod-nepenthes-rajah-1",
    "title": "Bình Nắp ấm Rajah sắc đỏ tía",
    "scientificName": "Nepenthes rajah",
    "role": "product",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "50% 50%",
    "alt": "Bình ấm Nepenthes rajah hình chuông lớn với nắp rộng che miệng ấm.",
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
    "placeholder": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAQCdASoQAAwAA8BgJbACdACZeycGZAAA/uyMGNzmbQCd18oTIw8o4IN6P/8NNIo/gKmwNQNEjUsbfroHkXVdyjbiwjXegASGimCzw5l/8y5AyfSTnKF8kGoAAA==",
    "credit": {
      "author": "NepGrower",
      "license": "Public domain",
      "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_rajah.png"
    }
  },
  "prod-nepenthes-ampullaria-1": {
    "id": "prod-nepenthes-ampullaria-1",
    "title": "Nắp ấm Ampullaria dòng xanh thuần (All-green)",
    "scientificName": "Nepenthes ampullaria",
    "role": "product",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "50% 50%",
    "alt": "Bình nắp ấm Nepenthes ampullaria màu xanh cốm tròn trịa nằm giữa lớp lá khô.",
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
    "placeholder": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAADwAQCdASoQAAwAA8BgJbACdAC9KpBIMzgAyy/tFXc/YpPFo2T1gLPtg0Hd9SId+WrquqqOyjdLe/7bzalhXGrqnd6Y6plv1thBmn/623vs1FqHtM48873VDEX5zKlTOQAAAA==",
    "credit": {
      "author": "NepGrower",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nep_amp_295.jpg"
    }
  },
  "biome/rainforest-canopy": {
    "id": "biome/rainforest-canopy",
    "title": "Đường mòn rừng nguyên sinh VQG Cúc Phương",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Con đường mòn xuyên qua tán rừng mưa nhiệt đới xanh thẫm tại Vườn quốc gia Cúc Phương, Việt Nam.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/rainforest-canopy-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/rainforest-canopy-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/rainforest-canopy-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAwAA8BgJYwCdACKIPiEAAD+6aZcsgaolQM5grpS6zmmxVIsPtyWPg3T2a/uzeZePQOjuMmiAAAA",
    "credit": {
      "author": "hds",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Forest_in_Cuc_Phuong_National_Park_(15706323528).jpg"
    }
  },
  "biome/cloud-forest-mist": {
    "id": "biome/cloud-forest-mist",
    "title": "Cầu treo xuyên tán rừng Taman Negara, Malaysia",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cầu treo đi bộ xuyên qua tầng tán cây cao vút của rừng mưa cổ đại Taman Negara.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/cloud-forest-mist-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/cloud-forest-mist-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/cloud-forest-mist-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACQAQCdASoQAAwAA8BgJYwAAoTJTAAA/tHs7S0Jpl0gJ/MAh7Ev1rkVBhwVnnegGDMnIhKxgd9lT5hK1Gh3vGNP4hF9dmpfww4dhcvfUuaCePwAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Taman_Negara,_Malaysia,_Canopy_Walkway.jpg"
    }
  },
  "biome/macro-leaf-droplet": {
    "id": "biome/macro-leaf-droplet",
    "title": "Lông cảm ứng cơ học trong lòng bẫy Dionaea muscipula",
    "scientificName": "Dionaea muscipula",
    "role": "biome",
    "width": 1527,
    "height": 1670,
    "aspectRatio": 0.91,
    "focus": "50% 50%",
    "alt": "Ảnh chụp đại cận cảnh các sợi lông cảm ứng kích hoạt xung điện bên trong lá bẫy cây bắt ruồi.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/macro-leaf-droplet-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/macro-leaf-droplet-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/macro-leaf-droplet-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACwAQCdASoQAAwAA8BgJbACdACSaj/IAP7qWlF57io3EfyHXfLaJV1+cS1+H/PUGx5QPBPOh6NoXXFZvQB9pOJX3/1Uszc5NzlHnugzmmx/+49YjJNiAVPkg5Jg64dzeXgx4Pb4NOg2YvYCCfcivEsAAAA=",
    "credit": {
      "author": "Noah Elhardt",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_Flytrap_showing_trigger_hairs.jpg"
    }
  },
  "biome/macro-moss-fern": {
    "id": "biome/macro-moss-fern",
    "title": "Dương xỉ thân gỗ (Cyathea sp.) và rừng núi cao",
    "role": "biome",
    "width": 1920,
    "height": 1262,
    "aspectRatio": 1.52,
    "focus": "50% 50%",
    "alt": "Những tán dương xỉ thân gỗ cổ đại vươn rộng giữa khu rừng ẩm sườn núi.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/macro-moss-fern-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/macro-moss-fern-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/macro-moss-fern-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAwAA8BgJYgCdAELLK8YaAAA/uhRsQ7ItAMI5hLI5CMBV//PYax7ECy1h6FRxQ4pEtzCZZetnX1jWPVNZRSJa+jDjjVdAAA=",
    "credit": {
      "author": "Bernard DUPONT from FRANCE",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tree_Ferns_(Cyathea_sp.)_and_Montane_Forest_(14647918801).jpg"
    }
  },
  "biome/fireflies-night": {
    "id": "biome/fireflies-night",
    "title": "Quần thể Nắp ấm Ampullaria trên thảm rêu rừng ẩm",
    "scientificName": "Nepenthes ampullaria",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Cụm bình Nepenthes ampullaria mọc dày đặc giữa thảm rêu ẩm dưới tán rừng.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/fireflies-night-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/fireflies-night-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/fireflies-night-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADwAQCdASoQAAwAA8BgJZACdAC8hcoupcAA+5WmIY/xBB9oVsOMyvzXsqIMkHyQMAVxQmefbThEW0fiYhIibzAUbR7/0XmxB1LBQj+p3L3LRSHJuzB8AA==",
    "credit": {
      "author": "Mgiganteus",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nepenthes_ampullaria_elongated.jpg"
    }
  },
  "biome/coral-reef-deep": {
    "id": "biome/coral-reef-deep",
    "title": "Cận cảnh mang ngoài Kỳ giông Axolotl dưới nước",
    "scientificName": "Ambystoma mexicanum",
    "role": "biome",
    "width": 1800,
    "height": 1235,
    "aspectRatio": 1.46,
    "focus": "50% 50%",
    "alt": "Cận cảnh đầu và hệ mang ngoài trao đổi oxy dưới nước của kỳ giông Axolotl.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/coral-reef-deep-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/coral-reef-deep-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/coral-reef-deep-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQAAwAA8BgJbACdAD2On+SZXgAAP70eE6ezjwPpQ4sQpfm8wkal1KN/XT7EqHQio0ubx0EJsJbsiO39MG5k8Nc6ZeasZfAITbgTG3RJAAxtFcwAAA=",
    "credit": {
      "author": "Stan Shebs",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_3.jpg"
    }
  },
  "biome/desert-savanna-sunset": {
    "id": "biome/desert-savanna-sunset",
    "title": "Vịnh đá vôi Calanque de Cassis ven Địa Trung Hải",
    "role": "biome",
    "width": 1920,
    "height": 1152,
    "aspectRatio": 1.67,
    "focus": "50% 50%",
    "alt": "Vách đá vôi trắng và làn nước xanh ngọc tại Calanque de Cassis, miền Nam nước Pháp.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/desert-savanna-sunset-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/desert-savanna-sunset-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/desert-savanna-sunset-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAQCdASoQAAwAA8BgJZwAAlZHq/W3AAD+5sH7yITaIJMRBJ6ldM7oxDsTyzM0fB710In3Dw7h4jy9f/iSLtJ1mCdmY64Ycgf/9Bh5a5qZMkfAdNFUcAAA",
    "credit": {
      "author": "Cocosea",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Calanque_de_Cassis.jpg"
    }
  },
  "biome/peat-swamp-waters": {
    "id": "biome/peat-swamp-waters",
    "title": "Dòng sông Tembeling giữa rừng già Taman Negara",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Thuyền gỗ nhỏ trên dòng sông Tembeling bao quanh bởi rừng mưa nhiệt đới Taman Negara, Malaysia.",
    "sources": {
      "avif": [
        {
          "src": "photos/biome/peat-swamp-waters-960.avif",
          "width": 960
        }
      ],
      "webp": [
        {
          "src": "photos/biome/peat-swamp-waters-960.webp",
          "width": 960
        }
      ],
      "jpg": "photos/biome/peat-swamp-waters-960.jpg"
    },
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJZwAAujXw4F1TMAA99/5n7IkqenvlvCfZ6QuwO3f++TPlDmKFQCeptGg14fv80pUeHBzi467d7CAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fishing_on_Tembeling_River,_Taman_Negara,_Malaysia.jpg"
    }
  }
};

export const TRIP_PHOTOS: Record<string, PhotoMetadata> = {
  "trail": {
    "id": "trip/trail",
    "title": "Forest in Cuc Phuong National Park (15706323528).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Forest in Cuc Phuong National Park (15706323528)",
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
    "title": "Cat Tien Park, Vietnam, tropical forest, roots.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Cat Tien Park, Vietnam, tropical forest, roots",
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
    "title": "Burmese Python photographed at Bardiya National Park2.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Burmese Python photographed at Bardiya National Park2",
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
    "title": "Fishing on Tembeling River, Taman Negara, Malaysia.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Fishing on Tembeling River, Taman Negara, Malaysia",
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
    "placeholder": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwAA8BgJZwAAujXw4F1TMAA99/5n7IkqenvlvCfZ6QuwO3f++TPlDmKFQCeptGg14fv80pUeHBzi467d7CAAAA=",
    "credit": {
      "author": "Vyacheslav Argenberg",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fishing_on_Tembeling_River,_Taman_Negara,_Malaysia.jpg"
    }
  },
  "walkway": {
    "id": "trip/walkway",
    "title": "Taman Negara, Malaysia, Canopy Walkway.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Taman Negara, Malaysia, Canopy Walkway",
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
    "title": "A view of the old rainforest- not much left unfortunately (11463945203).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1275,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "A view of the old rainforest- not much left unfortunately (11463945203)",
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
    "title": "Pitcher Plant (Nepenthes ampullaria) (14136485484).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1271,
    "aspectRatio": 1.51,
    "focus": "50% 50%",
    "alt": "Pitcher Plant (Nepenthes ampullaria) (14136485484)",
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
    "title": "Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 5.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 5",
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
    "title": "Tree Ferns (Cyathea sp.) and Montane Forest (14647918801).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1262,
    "aspectRatio": 1.52,
    "focus": "50% 50%",
    "alt": "Tree Ferns (Cyathea sp.) and Montane Forest (14647918801)",
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
    "title": "Large lower pitcher of wild Nepenthes rajah plant.jpg",
    "role": "biome",
    "width": 1488,
    "height": 1984,
    "aspectRatio": 0.75,
    "focus": "50% 50%",
    "alt": "Large lower pitcher of wild Nepenthes rajah plant",
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
    "title": "Longleaf Pine Savanna II (13158080455).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Longleaf Pine Savanna II (13158080455)",
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
    "title": "Venus Flytrap - Dionaea muscipula, Green Swamp, Supply, North Carolina, October 18, 2021 (51693075042).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Venus Flytrap - Dionaea muscipula, Green Swamp, Supply, North Carolina, October 18, 2021 (51693075042)",
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
    "title": "Trajineras (Xochimilco, 2009).JPG",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Trajineras (Xochimilco, 2009)",
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
    "title": "Ambystoma mexicanum.005 - Aquarium Finisterrae.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Ambystoma mexicanum.005 - Aquarium Finisterrae",
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
    "title": "Savanna landscape, Northern region, Ghana.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1370,
    "aspectRatio": 1.4,
    "focus": "50% 50%",
    "alt": "Savanna landscape, Northern region, Ghana",
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
    "title": "Python regius - ball python.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1201,
    "aspectRatio": 1.6,
    "focus": "50% 50%",
    "alt": "Python regius - ball python",
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
    "title": "Sunset in mountains, Turbat, Balochistan.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1098,
    "aspectRatio": 1.75,
    "focus": "50% 50%",
    "alt": "Sunset in mountains, Turbat, Balochistan",
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
    "title": "Eublepharis macularius 2009 G6.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Eublepharis macularius 2009 G6",
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
    "title": "Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3615.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3615",
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
    "title": "Pogona vitticeps close-up 2009 G1.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "focus": "50% 50%",
    "alt": "Pogona vitticeps close-up 2009 G1",
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
    "title": "Formation maquis.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Formation maquis",
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
    "title": "Testudo hermanni Boettgeri - 01.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Testudo hermanni Boettgeri - 01",
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
    "title": "Calanque de Cassis.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1152,
    "aspectRatio": 1.67,
    "focus": "50% 50%",
    "alt": "Calanque de Cassis",
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
    "title": "Nepenthes rajah (5).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Nepenthes rajah (5)",
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
    "title": "Pitcher Plants (Nepenthes ampullaria) (8410326499).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1440,
    "aspectRatio": 1.33,
    "focus": "50% 50%",
    "alt": "Pitcher Plants (Nepenthes ampullaria) (8410326499)",
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
    "title": "Axolotl ambystoma mexicanum anfibio ASAG.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "Axolotl ambystoma mexicanum anfibio ASAG",
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
    "title": "EUBLEPHARIS-MACULARIUS Leopard-Gecko Leopardgecko 201705276011.jpg",
    "role": "biome",
    "width": 1920,
    "height": 1280,
    "aspectRatio": 1.5,
    "focus": "50% 50%",
    "alt": "EUBLEPHARIS-MACULARIUS Leopard-Gecko Leopardgecko 201705276011",
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
    "title": "Venus flytrap (53886303376).jpg",
    "role": "biome",
    "width": 1920,
    "height": 1920,
    "aspectRatio": 1,
    "focus": "50% 50%",
    "alt": "Venus flytrap (53886303376)",
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

export type PhotoId = keyof typeof PHOTOS;

/**
 * Tra cứu ảnh đại diện chính (hero) theo tên khoa học loài.
 */
export function getHeroPhotoByScientificName(scientificName: string): PhotoMetadata | undefined {
  const mapping: Record<string, PhotoId> = {
    'Ambystoma mexicanum': 'axolotl/hero-1',
    'Nepenthes rajah': 'nepenthes-rajah/hero-1',
    'Python regius': 'ball-python/hero-1',
    'Eublepharis macularius': 'leopard-gecko/hero-1',
    'Dionaea muscipula': 'venus-flytrap/hero-1',
    'Python bivittatus': 'burmese-python/hero-1',
    'Pogona vitticeps': 'bearded-dragon/hero-1',
    'Testudo hermanni': 'hermann-tortoise/hero-1',
    'Nepenthes ampullaria': 'nepenthes-ampullaria/hero-1',
  };
  const photoId = mapping[scientificName];
  return photoId ? PHOTOS[photoId] : undefined;
}

/**
 * Tra cứu ảnh đại diện cho sản phẩm theo mã ID trong seed.
 */
export function getProductPhoto(productIdOrName: string): PhotoMetadata | undefined {
  const productKeyMap: Record<string, PhotoId> = {
    '1': 'prod-gecko-1',
    '2': 'prod-gecko-2',
    '3': 'prod-bearded-dragon-1',
    '4': 'prod-ball-python-1',
    '5': 'prod-burmese-python-1',
    '6': 'prod-hermann-tortoise-1',
    '7': 'prod-axolotl-1',
    '8': 'prod-venus-flytrap-1',
    '9': 'prod-nepenthes-rajah-1',
    '10': 'prod-nepenthes-ampullaria-1',
  };
  const photoId = productKeyMap[productIdOrName];
  return photoId ? PHOTOS[photoId] : undefined;
}
