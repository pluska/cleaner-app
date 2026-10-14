"use server";
import { auth } from "@/auth";
import { saveLayout } from "@/services/kingdomService";
export async function saveKingdomPlacements(positions: {id:string;x:number;y:number}[],version:number) {
  const session=await auth();
  if(!session?.user?.id) return {success:false,error:"Unauthorized"};
  return saveLayout(session.user.id,version,positions);
}
