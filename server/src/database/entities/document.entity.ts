import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Citizen } from './citizen.entity';

export enum DocumentType {
    BIRTH_CERTIFICATE = 'BirthCertificate',
    POLICE_REPORT = 'Policereport',
    NIC = 'NIC',
    OTHER = 'Other'
}

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 12 })
    citizenNic: string;

    @Column({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.OTHER
    })
    documentType: DocumentType;

    @Column({ type: 'varchar', length: 255 })
    originalName: string;

    @Column({ type: 'varchar', length: 255 })
    fileName: string;

    @Column({ type: 'varchar', length: 255 })
    filePath: string;

    @Column({ type: 'varchar', length: 50 })
    mimeType: string;

    @Column({ type: 'bigint' })
    fileSize: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Citizen, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'citizenNic', referencedColumnName: 'nic' })
    citizen: Citizen;
}
