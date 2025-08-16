import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { Division } from './division.entity';
import { Verification } from './verification.entity';
import { GNAppointment } from './gn-appointment.entity';
import { MTAppointment } from './mt-appointment.entity';

export enum CitizenGender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Other'
}

export enum CitizenVerificationStatus {
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    REJECTED = 'Rejected'
}

export enum CitizenAccountStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended'
}

@Entity('citizens')
export class Citizen {
    @PrimaryColumn({ type: 'varchar', length: 12, name: 'nic' })
    nic!: string;

    @Column({ type: 'varchar', length: 100, name: 'display_name' })
    displayName!: string;

    @Column({ type: 'varchar', length: 15, name: 'phone_number' })
    phoneNumber!: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true, name: 'email' })
    email?: string;

    @Column({
        type: 'enum',
        enum: CitizenGender,
        name: 'gender'
    })
    gender!: CitizenGender;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
    passwordHash?: string;

    @Column({
        type: 'enum',
        enum: CitizenVerificationStatus,
        default: CitizenVerificationStatus.PENDING,
        name: 'verification_status'
    })
    verificationStatus!: CitizenVerificationStatus;

    @Column({ type: 'timestamp', nullable: true, name: 'verification_date' })
    verificationDate?: Date;

    @Column({ type: 'text', nullable: true, name: 'address' })
    address?: string;

    @Column({ type: 'varchar', length: 6, nullable: true, name: 'division_id' })
    divisionId?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({
        type: 'enum',
        enum: CitizenAccountStatus,
        default: CitizenAccountStatus.ACTIVE,
        name: 'account_status'
    })
    accountStatus!: CitizenAccountStatus;

    // Relations
    @ManyToOne(() => Division, division => division.citizens)
    @JoinColumn({ name: 'division_id' })
    division?: Division;

    @OneToMany(() => Verification, verification => verification.citizen)
    verifications?: Verification[];

    @OneToMany(() => GNAppointment, appointment => appointment.citizen)
    gnAppointments?: GNAppointment[];

    @OneToMany(() => MTAppointment, appointment => appointment.citizen)
    mtAppointments?: MTAppointment[];
}
