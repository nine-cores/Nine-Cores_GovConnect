import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { Citizen } from './citizen.entity';

@Entity('divisions')
export class Division {
    @PrimaryColumn({ type: 'varchar', length: 6 })
    divisionId!: string;

    @Column({ type: 'varchar', length: 100 })
    divisionName!: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    gnUserId?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Relations
    @OneToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'gn_user_id' })
    gramaNiladhari?: User;

    @OneToMany(() => Citizen, citizen => citizen.division)
    citizens?: Citizen[];
}
