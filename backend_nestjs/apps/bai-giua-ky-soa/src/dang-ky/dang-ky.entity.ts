import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DangKy')
export class DangKy {
  @PrimaryGeneratedColumn({ name: 'MaDangKy' })
  maDangKy: number;

  @Column({ name: 'MaSV' })
  maSV: string;

  @Column({ name: 'MaDeTai' })
  maDeTai: number;

  @Column({
    name: 'NgayDangKy',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  ngayDangKy: Date;

  @Column({ name: 'TrangThai', default: 'Cho duyet' })
  trangThai: string;
}
