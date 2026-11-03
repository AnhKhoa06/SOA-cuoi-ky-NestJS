import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('SinhVien')
export class SinhVien {
  @PrimaryColumn({ name: 'MaSV' })
  MaSV: string;

  @Column({ name: 'HoTen' })
  hoTen: string;

  @Column({ name: 'Email', nullable: true })
  email: string;

  @Column({ name: 'Lop', nullable: true })
  lop: string;

  @Column({ name: 'Password', nullable: true, select: false })
  password: string;

  @Column({ name: 'Token', nullable: true, select: false })
  token: string;
}
