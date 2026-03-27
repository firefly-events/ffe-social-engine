import { UserPublicMetadata as FfeUserPublicMetadata, UserUnsafeMetadata as FfeUserUnsafeMetadata } from '@ffe/core/src/types';

declare global {
  interface UserPublicMetadata extends FfeUserPublicMetadata {}
  interface UserUnsafeMetadata extends FfeUserUnsafeMetadata {}
}
