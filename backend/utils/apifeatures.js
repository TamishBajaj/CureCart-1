class ApiFeatures{
    constructor(query,queryStr){
        this.query=query
        this.queryStr = queryStr
    }


    // search functionality

    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex: this.queryStr.keyword,
                $options:"i"
            },
            
        }:{}

        this.query=this.query.find({...keyword})
        return this
    }

    //filter functionality

    filter(){
        const queryCopy={...this.queryStr}
        const removeFields=["keyword","page","limit"]
        removeFields.forEach((key)=> delete queryCopy[key])

        // filter for price and ratings

        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`)



        this.query=this.query.find(JSON.parse(queryStr))
        return this
    }


    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page) || 1;
        const skip=(currentPage-1)*resultPerPage;
        this.query=this.query.skip(skip).limit(resultPerPage)
        return this

    }

}

module.exports=ApiFeatures