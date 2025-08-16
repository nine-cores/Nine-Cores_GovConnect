import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm';
import { Citizen } from './citizen.entity';

export enum SessionStatus {
    ACTIVE = 'Active',
    EXPIRED = 'Expired',
    REVOKED = 'Revoked'
}

export enum LoginMethod {
    PASSWORD = 'Password',
    OTP = 'OTP'
}

@Entity('citizen_sessions')
@Index(['citizenNic', 'status'])
@Index(['refreshToken'])
export class CitizenSession {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column({ type: 'varchar', length: 12, name: 'citizen_nic' })
    citizenNic!: string;

    @Column({ type: 'text', name: 'refresh_token' })
    refreshToken!: string;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE,
        name: 'status'
    })
    status!: SessionStatus;

    @Column({
        type: 'enum',
        enum: LoginMethod,
        name: 'login_method'
    })
    loginMethod!: LoginMethod;

    @Column({ type: 'timestamp', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
    ipAddress?: string;

    @Column({ type: 'text', nullable: true, name: 'user_agent' })
    userAgent?: string;

    @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
    lastUsedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => Citizen, citizen => citizen.nic)
    @JoinColumn({ name: 'citizen_nic' })
    citizen?: Citizen;

    // Helper methods
    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isActive(): boolean {
        return this.status === SessionStatus.ACTIVE && !this.isExpired();
    }
}
