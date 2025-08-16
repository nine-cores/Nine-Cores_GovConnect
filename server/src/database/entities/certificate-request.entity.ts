import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Citizen } from './citizen.entity';
import { GNAppointment } from './gn-appointment.entity';
import { Document } from './document.entity';

export enum CertificateType {
    CHARACTER = 'character',
    RESIDENCE = 'residence',
    BIRTH_VERIFICATION = 'birth_verification'
}

export enum RequestStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

@Entity('certificate_requests')
export class CertificateRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 12 })
    citizenNic: string;

    @Column({
        type: 'enum',
        enum: CertificateType
    })
    certificateType: CertificateType;

    @Column({ type: 'varchar', length: 255 })
    purpose: string;

    @Column({ type: 'json' })
    personalDetails: {
        married?: string;
        sriLankan?: string;
        occupation?: string;
        residencePeriod?: string;
        fatherName?: string;
        fatherAddress?: string;
        [key: string]: any;
    };

    @Column({ type: 'json' })
    documents: {
        birthCertificate?: string;
        nic?: string;
        [key: string]: any;
    };

    @Column({ type: 'varchar', nullable: true })
    appointmentId?: string;

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    status: RequestStatus;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'text', nullable: true })
    rejectionReason?: string;

    @Column({ type: 'varchar', nullable: true })
    processedBy?: string; // GN officer user ID

    @Column({ type: 'timestamp', nullable: true })
    processedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Citizen, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'citizenNic', referencedColumnName: 'nic' })
    citizen: Citizen;

    @ManyToOne(() => GNAppointment, { nullable: true })
    @JoinColumn({ name: 'appointmentId', referencedColumnName: 'gnAppointmentId' })
    appointment?: GNAppointment;
}
