export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isAvailable: boolean;
}

export interface Peminjaman {
  id: number;
  roomId: number;
  room?: Room;
  peminjam: string;
  tanggalPinjam: string;
  keperluan: string;
  status: string;
}