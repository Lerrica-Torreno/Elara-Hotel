import { prisma } from '../config/prisma.js';

export async function findOptimalRoom(reservationId) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { roomType: true }
  });
  if (!reservation) return null;

  const conflictingRoomIds = await prisma.reservation.findMany({
    where: {
      id: { not: reservation.id },
      assignedRoomId: { not: null },
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      checkInDate: { lt: reservation.checkOutDate },
      checkOutDate: { gt: reservation.checkInDate }
    },
    select: { assignedRoomId: true }
  });

  const blocked = conflictingRoomIds.map((item) => item.assignedRoomId).filter(Boolean);

  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId: reservation.roomTypeId,
      status: { in: ['AVAILABLE', 'RESERVED'] },
      ...(blocked.length ? { id: { notIn: blocked } } : {})
    },
    include: { roomType: true }
  });

  const scored = rooms.map((room) => ({
    room,
    score:
      (room.status === 'AVAILABLE' ? 100 : 50) -
      Math.max(0, room.roomType.capacity - reservation.guestCount) * 5 -
      Number(room.floor ?? 0) * 0.1
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.room ?? null;
}
