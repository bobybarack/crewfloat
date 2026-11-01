export async function api(path:string,data?:unknown){
  const response=await fetch(`/api/${path}`,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-CrewFloat':'1'},body:data===undefined?undefined:JSON.stringify(data)});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not complete this action.');return result;
}
