import {NameData} from "../processes/updateName";
import {CityData} from "../processes/updateCity";
import {AvatarData} from "../processes/updateAvatar";

export interface IProfile {
  /**
   * The unique identifier of the profile
   */
  id:number;
  /**
   * The circles safe address of the profile.
   * There might be more than one profile for a safe address.
   * If this is the case then the newest profile should be chosen.
   */
  address?:string;

  displayName: string;

  city?: CityData;
  avatar?: AvatarData;
}

export interface IPerson extends IProfile {
  name: NameData;
}

export interface IOrganisation extends IProfile {
  name: string;
}