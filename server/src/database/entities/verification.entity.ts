import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Citizen } from './citizen.entity';
import { User } from './user.entity';

export enum VerificationStatus {
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    REJECTED = 'Rejected'
}

@Entity('verifications')
export class Verification {
    @PrimaryGeneratedColumn()
    verificationId!: number;

    @Column({ type: 'varchar', length: 12 })
    citizenNic!: string;

    @Column({ type: 'varchar', length: 10 })
    gramaNiladhariId!: string;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING
    })
    status!: VerificationStatus;

    @Column({ type: 'timestamp', nullable: true })
    verificationDate?: Date;

    @Column({ type: 'text', nullable: true })
    comments?: string;

    // Relations
    @ManyToOne(() => Citizen, citizen => citizen.verifications)
    @JoinColumn({ name: 'citizen_nic' })
    citizen?: Citizen;

    @ManyToOne(() => User, user => user.verifications)
    @JoinColumn({ name: 'grama_niladhari_id' })
    gramaNiladhari?: User;
}
