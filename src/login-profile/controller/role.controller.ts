import { Controller} from '@nestjs/common';
import { UserType } from '../entities/role.entity';
import { Crud, CrudController } from '@nestjsx/crud';
import { RoleService } from '../service/role.service';

@Crud({
    model: {
      type: UserType,
    },
    query: {
      join: {
        
      },
    },
  })
@Controller('role')
export class RoleController implements CrudController<UserType> {

    
    constructor( 
        public service: RoleService,
    ) {}
    
    get base(): CrudController<UserType> {
        return this;
    }
}