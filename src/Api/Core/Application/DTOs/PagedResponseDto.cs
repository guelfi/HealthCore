using System;
using System.Collections.Generic;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class PagedResponseDto<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}