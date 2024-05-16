import { Injectable } from '@decorators/di';
import { ClientDb } from '../client';
import { Item } from 'dynamoose/dist/Item';
import { ModelType } from 'dynamoose/dist/General';
import { userSchema } from '../client/schemas/user.schema';
import { CognitoService } from '../common/aws/cognito.service';
import * as uuid from 'uuid';
import * as dotenv from 'dotenv';
import { AuthSignInDto, AuthSignUpDto } from 'src/controllers/dto/auth.dto';
dotenv.config();

class Users extends Item {
  userId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  private model: ModelType<Users>;
  private cognitoService: CognitoService;

  constructor(private clientDb: ClientDb) {
    this.model = this.clientDb.generateInitializer<Users>('User', userSchema);
    this.cognitoService = new CognitoService(
      process.env.AWS_REGION,
      process.env.AWS_CLIENT_ID,
      process.env.AWS_CLIENT_SECRET,
    );
  }

  async signUp(authDto: AuthSignUpDto) {
    try {
      const { email, password, name } = authDto;
      let user: any = null;
      this.model
        .scan('email')
        .contains(email)
        .exec()
        .then((users) => (user = users[0]))
        .catch(() => {});

      if (user) throw new Error('User already exists');

      const attributes = [
        {
          Name: 'name',
          Value: name,
        },
      ];

      const result = await this.cognitoService.signUp(
        email,
        password,
        attributes,
      );

      return result;
    } catch (error) {
      const { message } = error;
      console.log('-----> ~ authService ~ signUp ~ error:', message || error);
      throw new Error('Failed to sign up: ' + message);
    }
  }

  async confirmSignUp(authDto: AuthSignUpDto, code: string) {
    try {
      const { email, name, password } = authDto;

      await this.cognitoService.confirmSignUp(email, code);

      const user = await this.model.create({
        userId: uuid.v4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email,
        name,
      });

      const {
        AuthenticationResult: { AccessToken, RefreshToken },
      } = await this.cognitoService.signIn(email, password);

      return { accessToken: AccessToken, refreshToken: RefreshToken, user };
    } catch (error) {
      const { message } = error;
      console.log(
        '-----> ~ authService ~ confirmSignUp ~ error:',
        message || error,
      );
      throw new Error('Failed to confirm sign up: ' + error.message);
    }
  }

  async signIn(authDto: AuthSignInDto) {
    try {
      const { email, password } = authDto;
      let user: any = null;
      await this.model
        .scan('email')
        .contains(email)
        .exec()
        .then((users) => {
          user = users[0];
        })
        .catch(() => {});

      if (!user) throw new Error('User not found');

      const {
        AuthenticationResult: { AccessToken, RefreshToken },
      } = await this.cognitoService.signIn(email, password);

      return { accessToken: AccessToken, refreshToken: RefreshToken, user };
    } catch (error) {
      const { message } = error;
      console.log('-----> ~ authService ~ signIn ~ error:', message || error);
      throw new Error('Failed to sign in: ' + error.message);
    }
  }

  async signOut(accessToken: string) {
    try {
      return await this.cognitoService.signOut(accessToken);
    } catch (error) {
      const { message } = error;
      console.log('-----> ~ authService ~ signOut ~ error:', message || error);
      throw new Error('Failed to sign out: ' + error.message);
    }
  }
}
