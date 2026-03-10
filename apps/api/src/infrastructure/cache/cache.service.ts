import redisClient from "./redisClient";

class CacheService {
    async set(key : string,value: string,ttl?: number){
        if(ttl){
            await redisClient.set(key,value,{EX:ttl})
        }else{
            await redisClient.set(key,value)
        }
    }

    async get(key: string){
        return redisClient.get(key)
    }

    async delete(key:string){
        return redisClient.del(key)
    }
}


export default new CacheService