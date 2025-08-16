import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index
} from 'typeorm';
import { Citizen } from './citizen.entity';

export enum OTPType {
    LOGIN = 'Login',
    PASSWORD_RESET = 'PasswordReset',
    EMAIL_VERIFICATION = 'EmailVerification'
}

export enum OTPStatus {
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    EXPIRED = 'Expired',
    USED = 'Used'
}

@Entity('citizen_otps')
@Index(['citizenNic', 'type', 'status'])
export class CitizenOTP {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column({ type: 'varchar', length: 12, name: 'citizen_nic' })
    citizenNic!: string;

    @Column({ type: 'varchar', length: 6, name: 'otp_code' })
    otpCode!: string;

    @Column({
        type: 'enum',
        enum: OTPType,
        name: 'type'
    })
    type!: OTPType;

    @Column({
        type: 'enum',
        enum: OTPStatus,
        default: OTPStatus.PENDING,
        name: 'status'
    })
    status!: OTPStatus;

    @Column({ type: 'timestamp', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
    verifiedAt?: Date;

    @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
    ipAddress?: string;

    @Column({ type: 'text', nullable: true, name: 'user_agent' })
    userAgent?: string;

    @Column({ type: 'int', default: 0, name: 'attempt_count' })
    attemptCount!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    // Relations
    @ManyToOne(() => Citizen, citizen => citizen.nic)
    @JoinColumn({ name: 'citizen_nic' })
    citizen?: Citizen;

    // Helper methods
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return this.status === OTPStatus.PENDING && !this.isExpired();
    }
}
