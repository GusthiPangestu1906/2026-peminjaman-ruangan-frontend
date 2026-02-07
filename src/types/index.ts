export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  isAvailable: boolean;
}

export interface Peminjaman {
  id: number;
  peminjam: string;
  roomId: number;
  room?: Room; // Ini penting karena tadi di Swagger datanya include Room
  tanggalPinjam: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}