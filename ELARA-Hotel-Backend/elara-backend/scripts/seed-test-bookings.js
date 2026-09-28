import bcrypt from "bcryptjs";

import {
  prisma
} from "../src/config/prisma.js";

import {
  createReservation
} from "../src/services/reservation.service.js";

const SEED_TAG =
  "ELARA_SEED_50";

/*
|--------------------------------------------------------------------------
| ORIGINAL TEST GUESTS
|--------------------------------------------------------------------------
*/

const originalGuests = [
  {
    firstName: "Gwen",
    lastName: "Torreno",
    email: "gwen@gmail.com",
    password: "GwenTorreno25",
    phone: null,
    guestCount: 2,

    roomTypeCode: "DELUXE",
    checkInDate: "2026-10-03",
    checkOutDate: "2026-10-05",

    discountCode: "WELCOME10",

    note:
      "Weekend pricing + WELCOME10 discount"
  },

  {
    firstName: "Graciella",
    lastName: "Santos",
    email: "graciella@gmail.com",
    password: "GraciellaSantos24",
    phone: "09171234002",
    guestCount: 2,

    roomTypeCode: "SUITE",
    checkInDate: "2026-10-10",
    checkOutDate: "2026-10-13",

    promotionCode: "SUITE2000",

    note:
      "Suite pricing + SUITE2000 promotion"
  },

  {
    firstName: "Georgia",
    lastName: "Cruz",
    email: "gergia@gmail.com",
    password: "GeorgiaCruz23",
    phone: "09171234003",
    guestCount: 2,

    roomTypeCode: "TWIN",
    checkInDate: "2026-11-06",
    checkOutDate: "2026-11-10",

    discountCode: "STAY15",

    note:
      "STAY15 discount"
  },

  {
    firstName: "Girlie",
    lastName: "Palania",
    email: "girlie@gmail.com",
    password: "GirliePalania22",
    phone: "09171234004",
    guestCount: 4,

    roomTypeCode: "FAMILY",
    checkInDate: "2026-12-18",
    checkOutDate: "2026-12-22",

    promotionCode: "HOLIDAY20",

    note:
      "Holiday pricing + HOLIDAY20 promotion"
  },

  {
    firstName: "Gray",
    lastName: "Reynaldo",
    email: "gray@gmail.com",
    password: "GrayReynaldo21",
    phone: "09171234005",
    guestCount: 2,

    roomTypeCode: "DELUXE",
    checkInDate: "2026-11-20",
    checkOutDate: "2026-11-23",

    discountCode: "SAVE500",

    note:
      "Early booking + weekend pricing + SAVE500"
  },

  {
    firstName: "Portia",
    lastName: "Balibat",
    email: "portia@gmail.com",
    password: "PortiaBalibat20",
    phone: "09171234006",
    guestCount: 2,

    roomTypeCode: "SUITE",
    checkInDate: "2026-12-20",
    checkOutDate: "2026-12-24",

    discountCode: "PREMIUM1000",

    note:
      "Suite + holiday + early booking pricing"
  },

  {
    firstName: "Tasha",
    lastName: "Reyes",
    email: "tasha@gmail.com",
    password: "TashaReyes19",
    phone: "09171234007",
    guestCount: 2,

    roomTypeCode: "TWIN",
    checkInDate: "2026-10-06",
    checkOutDate: "2026-10-08",

    note:
      "Normal booking"
  },

  {
    firstName: "Sidney",
    lastName: "Alunan",
    email: "sidney@gmail.com",
    password: "SidneyAlunan18",
    phone: "09171234008",
    guestCount: 4,

    roomTypeCode: "FAMILY",
    checkInDate: "2026-10-13",
    checkOutDate: "2026-10-15",

    note:
      "Normal weekday booking"
  },

  /*
   * Chewy is intentionally created WITHOUT HOLIDAY20.
   * You can manually test the invalid October promo later.
   */
  {
    firstName: "Chewy",
    lastName: "Dela Cruz",
    email: "chewy@gmail.com",
    password: "ChewyDelaCruz17",
    phone: "09171234009",
    guestCount: 2,

    roomTypeCode: "DELUXE",
    checkInDate: "2026-10-20",
    checkOutDate: "2026-10-21",

    note:
      "Negative test - manually try HOLIDAY20"
  },

  /*
   * Marinelle is intentionally created WITHOUT STAY15.
   * You can manually test the minimum-spend rejection later.
   */
  {
    firstName: "Marinelle",
    lastName: "Torrano",
    email: "marinelle@gmail.com",
    password: "MarinelleTorrano16",
    phone: "09171234010",
    guestCount: 2,

    roomTypeCode: "TWIN",
    checkInDate: "2026-10-02",
    checkOutDate: "2026-10-03",

    note:
      "Negative test - manually try STAY15"
  },

  {
    firstName: "Brian",
    lastName: "Gabriel",
    email: "brian@gmail.com",
    password: "BrianGabriel15",
    phone: "09171234011",
    guestCount: 4,

    roomTypeCode: "FAMILY",
    checkInDate: "2026-10-08",
    checkOutDate: "2026-10-11",

    note:
      "Cancellation test - cancel before payment"
  },

  {
    firstName: "Dorothy",
    lastName: "Ocampo",
    email: "dorothy@gmail.com",
    password: "DorothyOcampo14",
    phone: "09171234012",
    guestCount: 2,

    roomTypeCode: "DELUXE",
    checkInDate: "2026-10-16",
    checkOutDate: "2026-10-18",

    discountCode: "WELCOME10",

    note:
      "Cancellation test - WELCOME10 then cancel"
  }
];

/*
|--------------------------------------------------------------------------
| ADDITIONAL 38 GUEST NAMES
|--------------------------------------------------------------------------
*/

const additionalNames = [
  ["Alyssa", "Mendoza"],
  ["Jerome", "Castillo"],
  ["Camille", "Navarro"],
  ["Paolo", "Domingo"],
  ["Angelica", "Flores"],
  ["Joshua", "Villanueva"],
  ["Nicole", "Ramos"],
  ["Carlo", "Bautista"],
  ["Samantha", "Garcia"],
  ["Miguel", "Lim"],

  ["Patricia", "Aquino"],
  ["Francis", "Rivera"],
  ["Beatrice", "Lopez"],
  ["Kevin", "Santiago"],
  ["Danica", "Valdez"],
  ["Rafael", "Soriano"],
  ["Clarisse", "Manalo"],
  ["Anton", "Magsino"],
  ["Bianca", "Salazar"],
  ["Jared", "Mercado"],

  ["Trisha", "Velasco"],
  ["Noel", "Gonzales"],
  ["Katrina", "Abad"],
  ["Luis", "Pascual"],
  ["Monica", "Rosales"],
  ["Nathan", "Francisco"],
  ["Jasmine", "Padilla"],
  ["Marco", "Aguilar"],
  ["Elaine", "Torres"],
  ["Vincent", "Marquez"],

  ["Denise", "Cabrera"],
  ["Gabriel", "Fernandez"],
  ["Isabel", "Lorenzo"],
  ["Aaron", "David"],
  ["Marianne", "Chua"],
  ["Christian", "Ong"],
  ["Andrea", "Sy"],
  ["Patrick", "Tan"]
];

/*
|--------------------------------------------------------------------------
| BOOKING TEMPLATES
|--------------------------------------------------------------------------
|
| These cycle across the 38 generated guests.
|
| They intentionally mix:
| - normal bookings
| - discounts
| - promotions
| - Deluxe / Twin / Family / Suite
| - October / November / December
|
*/

const bookingTemplates = [
  {
    roomTypeCode: "DELUXE",
    checkInDate: "2026-10-05",
    checkOutDate: "2026-10-08",
    guestCount: 2,
    discountCode: "WELCOME10",
    note:
      "WELCOME10 discount"
  },

  {
    roomTypeCode: "TWIN",
    checkInDate: "2026-10-09",
    checkOutDate: "2026-10-12",
    guestCount: 2,
    promotionCode: "WEEKEND15",
    note:
      "WEEKEND15 promotion"
  },

  {
    roomTypeCode: "FAMILY",
    checkInDate: "2026-10-19",
    checkOutDate: "2026-10-22",
    guestCount: 4,
    discountCode: "SAVE500",
    note:
      "SAVE500 discount"
  },

  {
    roomTypeCode: "SUITE",
    checkInDate: "2026-10-23",
    checkOutDate: "2026-10-27",
    guestCount: 2,
    promotionCode: "SUITE2000",
    note:
      "SUITE2000 promotion"
  },

  {
    roomTypeCode: "DELUXE",
    checkInDate: "2026-10-27",
    checkOutDate: "2026-10-29",
    guestCount: 2,
    note:
      "Normal booking"
  },

  {
    roomTypeCode: "TWIN",
    checkInDate: "2026-11-02",
    checkOutDate: "2026-11-06",
    guestCount: 2,
    discountCode: "STAY15",
    note:
      "STAY15 discount"
  },

  {
    roomTypeCode: "FAMILY",
    checkInDate: "2026-11-09",
    checkOutDate: "2026-11-12",
    guestCount: 3,
    promotionCode: "STAY10",
    note:
      "STAY10 promotion"
  },

  {
    roomTypeCode: "SUITE",
    checkInDate: "2026-11-13",
    checkOutDate: "2026-11-17",
    guestCount: 2,
    discountCode: "PREMIUM1000",
    note:
      "Suite + PREMIUM1000"
  },

  {
    roomTypeCode: "DELUXE",
    checkInDate: "2026-11-20",
    checkOutDate: "2026-11-23",
    guestCount: 2,
    discountCode: "MIDWEEK12",
    note:
      "MIDWEEK12 discount"
  },

  {
    roomTypeCode: "TWIN",
    checkInDate: "2026-11-24",
    checkOutDate: "2026-11-27",
    guestCount: 2,
    note:
      "Normal Twin booking"
  },

  {
    roomTypeCode: "FAMILY",
    checkInDate: "2026-12-02",
    checkOutDate: "2026-12-06",
    guestCount: 4,
    promotionCode: "FIRST1000",
    note:
      "FIRST1000 promotion"
  },

  {
    roomTypeCode: "SUITE",
    checkInDate: "2026-12-07",
    checkOutDate: "2026-12-11",
    guestCount: 2,
    promotionCode: "SUITE2000",
    note:
      "Executive Suite promotion"
  },

  {
    roomTypeCode: "DELUXE",
    checkInDate: "2026-12-16",
    checkOutDate: "2026-12-19",
    guestCount: 2,
    promotionCode: "HOLIDAY20",
    note:
      "Holiday pricing + HOLIDAY20"
  },

  {
    roomTypeCode: "FAMILY",
    checkInDate: "2026-12-20",
    checkOutDate: "2026-12-24",
    guestCount: 4,
    promotionCode: "HOLIDAY20",
    note:
      "Holiday Family booking"
  },

  {
    roomTypeCode: "SUITE",
    checkInDate: "2026-12-26",
    checkOutDate: "2026-12-30",
    guestCount: 2,
    discountCode: "PREMIUM1000",
    note:
      "Holiday Suite + PREMIUM1000"
  },

  {
    roomTypeCode: "TWIN",
    checkInDate: "2026-10-12",
    checkOutDate: "2026-10-14",
    guestCount: 2,
    note:
      "Normal weekday booking"
  }
];

/*
|--------------------------------------------------------------------------
| BUILD ADDITIONAL 38 BOOKINGS
|--------------------------------------------------------------------------
*/

const additionalGuests =
  additionalNames.map(
    (
      [
        firstName,
        lastName
      ],
      index
    ) => {
      const template =
        bookingTemplates[
          index %
            bookingTemplates.length
        ];

      const number =
        index + 13;

      const safeFirstName =
        firstName
          .toLowerCase()
          .replace(
            /[^a-z0-9]/g,
            ""
          );

      const safeLastName =
        lastName
          .toLowerCase()
          .replace(
            /[^a-z0-9]/g,
            ""
          );

      return {
        firstName,
        lastName,

        email:
          `${safeFirstName}.${safeLastName}${number}@example.com`,

        password:
          `${firstName}${lastName}${number}Test`,

        phone:
          `0918${String(
            1234000 +
              number
          ).slice(-7)}`,

        ...template
      };
    }
  );

/*
|--------------------------------------------------------------------------
| FINAL 50 RECORDS
|--------------------------------------------------------------------------
*/

const guests = [
  ...originalGuests,
  ...additionalGuests
];

if (
  guests.length !==
  50
) {
  throw new Error(
    `Expected exactly 50 guests, but generated ${guests.length}.`
  );
}

/*
|--------------------------------------------------------------------------
| REQUIRED OFFERS
|--------------------------------------------------------------------------
*/

async function ensureRequiredOffersExist() {
  const discountCodes = [
    "WELCOME10",
    "STAY15",
    "SAVE500",
    "PREMIUM1000",
    "MIDWEEK12"
  ];

  const promotionCodes = [
    "WEEKEND15",
    "SUITE2000",
    "HOLIDAY20",
    "STAY10",
    "FIRST1000"
  ];

  const discounts =
    await prisma.discount.findMany({
      where: {
        code: {
          in:
            discountCodes
        }
      },

      select: {
        code: true
      }
    });

  const promotions =
    await prisma.promotion.findMany({
      where: {
        code: {
          in:
            promotionCodes
        }
      },

      select: {
        code: true
      }
    });

  const existingDiscounts =
    new Set(
      discounts.map(
        (item) =>
          item.code
      )
    );

  const existingPromotions =
    new Set(
      promotions.map(
        (item) =>
          item.code
      )
    );

  const missingDiscounts =
    discountCodes.filter(
      (code) =>
        !existingDiscounts.has(
          code
        )
    );

  const missingPromotions =
    promotionCodes.filter(
      (code) =>
        !existingPromotions.has(
          code
        )
    );

  if (
    missingDiscounts.length ||
    missingPromotions.length
  ) {
    console.error("");
    console.error(
      "Missing required offers."
    );

    if (
      missingDiscounts.length
    ) {
      console.error(
        `Discounts: ${missingDiscounts.join(
          ", "
        )}`
      );
    }

    if (
      missingPromotions.length
    ) {
      console.error(
        `Promotions: ${missingPromotions.join(
          ", "
        )}`
      );
    }

    console.error("");
    console.error(
      "Create these in Admin before running the seed."
    );

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| ROOM TYPE LOOKUP
|--------------------------------------------------------------------------
*/

async function getRoomTypes() {
  const roomTypes =
    await prisma.roomType.findMany({
      where: {
        code: {
          in: [
            "DELUXE",
            "TWIN",
            "FAMILY",
            "SUITE"
          ]
        }
      }
    });

  const map =
    new Map();

  for (
    const roomType
    of roomTypes
  ) {
    map.set(
      roomType.code,
      roomType
    );
  }

  for (
    const code
    of [
      "DELUXE",
      "TWIN",
      "FAMILY",
      "SUITE"
    ]
  ) {
    if (
      !map.has(
        code
      )
    ) {
      throw new Error(
        `Missing room type with code ${code}.`
      );
    }
  }

  return map;
}

/*
|--------------------------------------------------------------------------
| CUSTOMER ACCOUNT
|--------------------------------------------------------------------------
*/

async function createOrUpdateCustomer(
  guest
) {
  const normalizedEmail =
    guest.email
      .trim()
      .toLowerCase();

  const passwordHash =
    await bcrypt.hash(
      guest.password,
      12
    );

  let user =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail
      },

      include: {
        customerProfile: true
      }
    });

  if (
    user &&
    user.role !==
      "CUSTOMER"
  ) {
    throw new Error(
      `${normalizedEmail} belongs to a staff account.`
    );
  }

  if (
    !user
  ) {
    user =
      await prisma.user.create({
        data: {
          email:
            normalizedEmail,

          passwordHash,

          firstName:
            guest.firstName,

          lastName:
            guest.lastName,

          role:
            "CUSTOMER",

          isActive:
            true
        },

        include: {
          customerProfile:
            true
        }
      });
  } else {
    user =
      await prisma.user.update({
        where: {
          id:
            user.id
        },

        data: {
          firstName:
            guest.firstName,

          lastName:
            guest.lastName,

          passwordHash,

          isActive:
            true
        },

        include: {
          customerProfile:
            true
        }
      });
  }

  let profile =
    user.customerProfile;

  if (
    profile
  ) {
    profile =
      await prisma.customerProfile.update({
        where: {
          id:
            profile.id
        },

        data: {
          phone:
            guest.phone ??
            null
        }
      });
  } else {
    profile =
      await prisma.customerProfile.create({
        data: {
          userId:
            user.id,

          phone:
            guest.phone ??
            null
        }
      });
  }

  return profile;
}

/*
|--------------------------------------------------------------------------
| REMOVE PREVIOUS VERSION OF THIS SEED
|--------------------------------------------------------------------------
|
| Only reservations marked with ELARA_SEED_50 are removed.
| Your manually created reservations remain untouched.
|
*/

async function deletePreviousSeedReservations() {
  const previous =
    await prisma.reservation.findMany({
      where: {
        specialRequests: {
          contains:
            SEED_TAG
        }
      },

      select: {
        id: true
      }
    });

  if (
    !previous.length
  ) {
    console.log(
      "No previous 50-record seed found."
    );

    return;
  }

  const ids =
    previous.map(
      (item) =>
        item.id
    );

  const result =
    await prisma.reservation.deleteMany({
      where: {
        id: {
          in:
            ids
        }
      }
    });

  console.log(
    `Removed ${result.count} previous seeded reservations.`
  );
}

/*
|--------------------------------------------------------------------------
| SEED ONE RESERVATION
|--------------------------------------------------------------------------
*/

async function seedReservation(
  guest,
  roomTypeMap,
  position
) {
  const profile =
    await createOrUpdateCustomer(
      guest
    );

  const roomType =
    roomTypeMap.get(
      guest.roomTypeCode
    );

  const payload = {
    roomTypeId:
      roomType.id,

    guestFirstName:
      guest.firstName,

    guestLastName:
      guest.lastName,

    guestEmail:
      guest.email
        .trim()
        .toLowerCase(),

    guestPhone:
      guest.phone ??
      null,

    guestCount:
      Number(
        guest.guestCount ??
          2
      ),

    specialRequests:
      `${SEED_TAG} | #${position} | ${guest.note}`,

    checkInDate:
      guest.checkInDate,

    checkOutDate:
      guest.checkOutDate
  };

  if (
    guest.discountCode
  ) {
    payload.discountCode =
      guest.discountCode;
  }

  if (
    guest.promotionCode
  ) {
    payload.promotionCode =
      guest.promotionCode;
  }

  const reservation =
    await createReservation(
      payload,
      profile.id,
      null
    );

  return {
    reservation,
    roomType
  };
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {
  console.log("");
  console.log(
    "========================================"
  );

  console.log(
    " ELARA - 50 TEST BOOKINGS"
  );

  console.log(
    "========================================"
  );

  console.log("");

  try {
    await ensureRequiredOffersExist();

    const roomTypeMap =
      await getRoomTypes();

    await deletePreviousSeedReservations();

    let created = 0;
    let failed = 0;

    for (
      let index = 0;
      index <
      guests.length;
      index += 1
    ) {
      const guest =
        guests[index];

      try {
        const {
          reservation,
          roomType
        } =
          await seedReservation(
            guest,
            roomTypeMap,
            index + 1
          );

        created += 1;

        console.log(
          `✓ #${index + 1} ${guest.firstName} ${guest.lastName}`
        );

        console.log(
          `  ${reservation.reference}`
        );

        console.log(
          `  ${roomType.name}`
        );

        console.log(
          `  ${guest.checkInDate} → ${guest.checkOutDate}`
        );

        if (
          guest.discountCode
        ) {
          console.log(
            `  Discount: ${guest.discountCode}`
          );
        }

        if (
          guest.promotionCode
        ) {
          console.log(
            `  Promotion: ${guest.promotionCode}`
          );
        }

        console.log(
          `  Total: ₱${Number(
            reservation.totalAmount
          ).toLocaleString(
            "en-PH",
            {
              minimumFractionDigits:
                2,
              maximumFractionDigits:
                2
            }
          )}`
        );

        console.log("");
      } catch (
        error
      ) {
        failed += 1;

        console.error(
          `✗ #${index + 1} ${guest.firstName} ${guest.lastName}`
        );

        console.error(
          `  ${
            error.message ??
            error
          }`
        );

        console.error("");
      }
    }

    console.log(
      "========================================"
    );

    console.log(
      `Created: ${created}`
    );

    console.log(
      `Failed:  ${failed}`
    );

    console.log(
      `Total:   ${guests.length}`
    );

    console.log("");

    console.log(
      "Emmanuel Tan: NOT created"
    );

    console.log(
      "Yuko Hirano: NOT created"
    );

    console.log(
      "========================================"
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(
  (error) => {
    console.error(
      "Seed failed:"
    );

    console.error(
      error
    );

    process.exitCode =
      1;
  }
);