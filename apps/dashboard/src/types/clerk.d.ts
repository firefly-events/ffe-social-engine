import { UserPublicMetadata as FfeUserPublicMetadata, UserUnsafeMetadata as FfeUserUnsafeMetadata } from '@ffe/core/types';

declare global {
  interface UserPublicMetadata extends FfeUserPublicMetadata {}
  interface UserUnsafeMetadata extends FfeUserUnsafeMetadata {}
}
