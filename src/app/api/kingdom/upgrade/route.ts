import { readJson, errorResponse } from "@/libs/server/http";
import { auth } from "@/auth";
import { database } from "@/db";
export async function POST(request:Request){
  const session=await auth();if(!session?.user?.id)return Response.json({error:"Unauthorized"},{status:401});
  try{
    const {buildingId,level}=await readJson(request);
    if(typeof buildingId!=="string"||typeof level!=="number"||![1,2].includes(level))return Response.json({error:"Invalid upgrade"},{status:400});
    const result=await database().prepare("UPDATE kingdomBuildings SET level=level+1 WHERE id=? AND userId=? AND level=? AND EXISTS(SELECT 1 FROM userProfiles WHERE userId=? AND coins>=?) RETURNING level").bind(buildingId,session.user.id,level,session.user.id,level*4).all();
    return result.results.length?Response.json({success:true}):Response.json({error:"Saldo insuficiente o edificio ya mejorado. Recarga tu reino."},{status:409});
  }catch(error){return errorResponse(error);}
}
