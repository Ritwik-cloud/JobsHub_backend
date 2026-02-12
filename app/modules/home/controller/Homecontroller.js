const blogRepositories = require("../../blog/repositories/blogRepositories");
const jobCategoryRepositories = require("../../predefined_data/repositories/jobcategoryRepositories");
const locationRepositories = require("../../predefined_data/repositories/locationRepositories");

class HomeController{
    async getHomePage(req,res){
        try {
            const locations=await locationRepositories.getAllLocations();
            const jobCategoriesInJobs=await jobCategoryRepositories.getJobCategoriesInJobs();
            const latestBlogs=await blogRepositories.getCurrentBlogs(3);
            
            return res.render('home/index',{title:'Home',locations,jobCategoriesInJobs,latestBlogs});
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports=new HomeController();
