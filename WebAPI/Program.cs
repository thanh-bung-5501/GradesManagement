using BusinessObjects;
using Microsoft.AspNetCore.OData;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using WebAPI.Models;

#region Config-Odata
static IEdmModel GetEdmModel()
{
    ODataConventionModelBuilder builder = new();
    builder.EntitySet<GradesDTO>("Grades");
    builder.EntitySet<UserDTO>("User");
    builder.EntitySet<RoleDTO>("Role");
    builder.EntitySet<SubjectDTO>("Subject");
    return builder.GetEdmModel();
}

#endregion

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region Config-Odata

builder.Services.AddControllers()
    .AddOData(options => options
        .AddRouteComponents("odata", GetEdmModel())
        .Select()
        .Filter()
        .OrderBy()
        .SetMaxTop(20)
    .Count()
    .Expand()
);

#endregion

#region Config-Dbcontext

builder.Services.AddDbContext<MyDBcontext>();

#endregion

#region Config-AutoMapper

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

#endregion

#region Config-JQuery(AJAX)

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("https://localhost:8000")
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

#region Config-JQuery(AJAX)

app.UseCors("AllowSpecificOrigin");

#endregion

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
