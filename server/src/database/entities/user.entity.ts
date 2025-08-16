import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { auth } from '@/config';
import { ServiceUnit } from './service-unit.entity';
import { Verification } from './verification.entity';
import { GNAvailability } from './gn-availability.entity';
import { MTAvailability } from './mt-availability.entity';
import { GNAppointment } from './gn-appointment.entity';
import { MTAppointment } from './mt-appointment.entity';

export enum UserRole {
    GN = 'GN',
    STAFF_MT = 'Staff-MT',
    ADMIN = 'Admin'
}

export enum UserAccountStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    SUSPENDED = 'Suspended'
}

@Entity('users')
export class User {
    @PrimaryColumn({ type: 'varchar', length: 10 })
    userId!: string;

    @Column({ type: 'varchar', length: 12, unique: true, nullable: true })
    nic?: string;

    @Column({ type: 'varchar', length: 100 })
    displayName!: string;

    @Column({ type: 'varchar', length: 15 })
    phoneNumber!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash!: string;

    @Column({
        type: 'enum',
        enum: UserRole
    })
    role!: UserRole;

    @Column({ type: 'varchar', length: 10, nullable: true })
    serviceUnitId?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({
        type: 'enum',
        enum: UserAccountStatus,
        default: UserAccountStatus.ACTIVE
    })
    accountStatus!: UserAccountStatus;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refreshToken?: string;

    // Relations
    @ManyToOne(() => ServiceUnit, serviceUnit => serviceUnit.users)
    @JoinColumn({ name: 'service_unit_id' })
    serviceUnit?: ServiceUnit;

    @OneToMany(() => Verification, verification => verification.gramaNiladhari)
    verifications?: Verification[];

    @OneToMany(() => GNAvailability, availability => availability.user)
    gnAvailabilities?: GNAvailability[];

    @OneToMany(() => MTAvailability, availability => availability.user)
    mtAvailabilities?: MTAvailability[];

    @OneToMany(() => GNAppointment, appointment => appointment.user)
    gnAppointments?: GNAppointment[];

    @OneToMany(() => MTAppointment, appointment => appointment.user)
    mtAppointments?: MTAppointment[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        // Only hash if password is plain text (not already hashed)
        if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
            this.passwordHash = await bcrypt.hash(this.passwordHash, auth.salt);
        }
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.passwordHash);
    }

    get fullName(): string {
        return this.displayName;
    }

    toJSON() {
        const { passwordHash, refreshToken, ...user } = this;
        return user;
    }
}
