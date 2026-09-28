export function findOptimalRoom({
  rooms,
  reservation
}) {
  if (!reservation) {
    return null;
  }

  const candidates =
    rooms.filter(
      (room) =>
        room.status ===
          "Available" &&
        Number(
          room.capacity
        ) >=
          Number(
            reservation.guestCount ||
              1
          )
    );

  if (!candidates.length) {
    return null;
  }

  const scored =
    candidates.map(
      (room) => {
        let score = 0;

        if (
          reservation.roomType &&
          room.roomType ===
            reservation.roomType
        ) {
          score += 100;
        }

        const unusedCapacity =
          Number(
            room.capacity
          ) -
          Number(
            reservation.guestCount ||
              1
          );

        score -=
          unusedCapacity *
          5;

        /*
         * Slight preference for lower
         * floor numbers where all other
         * factors are equal.
         */
        score -=
          Number(
            room.floor || 0
          ) *
          0.1;

        return {
          room,
          score
        };
      }
    );

  scored.sort(
    (a, b) =>
      b.score -
      a.score
  );

  return (
    scored[0]?.room ??
    null
  );
}