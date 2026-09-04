import { Message } from "@/model/User";

export interface APIresponse{
    success : boolean;
    message : string;
    isAcceptingMessages? : boolean;
    messages? : Array<Message>;
}

// typesafety and suggestions