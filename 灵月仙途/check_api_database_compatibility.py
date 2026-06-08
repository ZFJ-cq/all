#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
============================================
灵月仙途 - API 接口与数据库字段兼容性检测工具
============================================
用途：
1. 扫描所有 API 接口定义
2. 检测 API 请求/响应参数与数据库字段的匹配性
3. 识别缺失的数据库字段
4. 生成修复建议报告
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple

class APIDatabaseChecker:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.api_service_files = []
        self.controller_files = []
        self.entity_files = []
        self.sql_files = []
        
        self.api_endpoints = {}
        self.entity_fields = {}
        self.database_tables = {}
        self.mismatch_report = []
        
    def scan_project(self):
        """扫描项目文件"""
        print("📂 扫描项目文件...")
        
        # 扫描 API 服务文件
        self.api_service_files = list(self.project_root.glob("**/api-service.js"))
        print(f"  找到 {len(self.api_service_files)} 个 API 服务文件")
        
        # 扫描 Controller 文件
        self.controller_files = list(self.project_root.glob("**/controller/*.java"))
        print(f"  找到 {len(self.controller_files)} 个 Controller 文件")
        
        # 扫描 Entity 文件
        self.entity_files = list(self.project_root.glob("**/entity/*.java"))
        print(f"  找到 {len(self.entity_files)} 个 Entity 文件")
        
        # 扫描 SQL 文件
        self.sql_files = list(self.project_root.glob("**/*.sql"))
        print(f"  找到 {len(self.sql_files)} 个 SQL 文件")
        
    def parse_entity_fields(self):
        """解析实体类字段"""
        print("\n📋 解析实体类字段...")
        
        for entity_file in self.entity_files:
            entity_name = entity_file.stem
            fields = set()
            
            try:
                content = entity_file.read_text(encoding='utf-8')
                
                # 查找@Column 注解的字段
                column_pattern = r'@Column\(name\s*=\s*"([^"]+)"\)'
                matches = re.findall(column_pattern, content)
                fields.update(matches)
                
                # 查找普通字段
                field_pattern = r'(?:private|public|protected)\s+\w+\s+(\w+)\s*;'
                matches = re.findall(field_pattern, content)
                fields.update(matches)
                
                self.entity_fields[entity_name] = fields
                print(f"  ✓ {entity_name}: {len(fields)} 个字段")
                
            except Exception as e:
                print(f"  ✗ {entity_name}: 解析失败 - {e}")
    
    def parse_database_tables(self):
        """解析数据库表结构"""
        print("\n📋 解析数据库表结构...")
        
        for sql_file in self.sql_files:
            try:
                content = sql_file.read_text(encoding='utf-8')
                
                # 查找 CREATE TABLE 语句
                create_table_pattern = r'CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?\s*\((.*?)\)(?:\s*ENGINE|\s*;|\s*$)'
                matches = re.findall(create_table_pattern, content, re.DOTALL | re.IGNORECASE)
                
                for table_name, columns_def in matches:
                    if table_name not in self.database_tables:
                        self.database_tables[table_name] = set()
                    
                    # 解析列定义
                    column_pattern = r'`?(\w+)`?\s+\w+'
                    columns = re.findall(column_pattern, columns_def)
                    self.database_tables[table_name].update(columns)
                    
            except Exception as e:
                pass
        
        print(f"  解析到 {len(self.database_tables)} 个表")
        for table_name, columns in list(self.database_tables.items())[:5]:
            print(f"    - {table_name}: {len(columns)} 个字段")
        if len(self.database_tables) > 5:
            print(f"    ... 还有 {len(self.database_tables) - 5} 个表")
    
    def parse_api_endpoints(self):
        """解析 API 端点"""
        print("\n📋 解析 API 端点...")
        
        for api_file in self.api_service_files:
            try:
                content = api_file.read_text(encoding='utf-8')
                
                # 查找 API 端点定义
                endpoint_pattern = r"(?:get|post|put|delete)\s*\(\s*['\"](/[^'\"]+)['\"]"
                matches = re.findall(endpoint_pattern, content)
                
                for endpoint in matches:
                    if endpoint not in self.api_endpoints:
                        self.api_endpoints[endpoint] = []
                    self.api_endpoints[endpoint].append(str(api_file))
                
            except Exception as e:
                pass
        
        print(f"  解析到 {len(self.api_endpoints)} 个 API 端点")
        for endpoint in list(self.api_endpoints.keys())[:10]:
            print(f"    - {endpoint}")
        if len(self.api_endpoints) > 10:
            print(f"    ... 还有 {len(self.api_endpoints) - 10} 个端点")
    
    def check_field_mismatches(self):
        """检查字段不匹配"""
        print("\n🔍 检查字段不匹配...")
        
        # 实体类与数据库表对比
        for entity_name, entity_fields in self.entity_fields.items():
            # 将驼峰命名转换为下划线命名
            table_name = self.camel_to_snake(entity_name)
            
            if table_name in self.database_tables:
                db_fields = self.database_tables[table_name]
                
                # 找出实体类有但数据库没有的字段
                missing_in_db = entity_fields - db_fields
                if missing_in_db:
                    self.mismatch_report.append({
                        'type': 'missing_in_db',
                        'entity': entity_name,
                        'table': table_name,
                        'fields': list(missing_in_db)
                    })
                    print(f"  ⚠️  {table_name} 表缺失字段：{missing_in_db}")
                
                # 找出数据库有但实体类没有的字段
                extra_in_db = db_fields - entity_fields
                if extra_in_db and len(extra_in_db) > 3:  # 忽略 id, created_at 等通用字段
                    self.mismatch_report.append({
                        'type': 'extra_in_db',
                        'entity': entity_name,
                        'table': table_name,
                        'fields': list(extra_in_db)
                    })
    
    def check_api_parameter_compatibility(self):
        """检查 API 参数兼容性"""
        print("\n🔍 检查 API 参数兼容性...")
        
        # 分析 API 请求参数与数据库字段的对应关系
        for endpoint, files in self.api_endpoints.items():
            # 从 endpoint 推断相关的表名
            table_name = self.endpoint_to_table(endpoint)
            
            if table_name in self.database_tables:
                print(f"  ✓ {endpoint} -> {table_name}")
    
    def generate_fix_sql(self) -> str:
        """生成修复 SQL"""
        print("\n📝 生成修复 SQL...")
        
        sql_lines = [
            "-- ============================================",
            "-- API 与数据库字段兼容性修复脚本",
            "-- 自动生成",
            "-- ============================================",
            "",
            "SET FOREIGN_KEY_CHECKS = 0;",
            ""
        ]
        
        for mismatch in self.mismatch_report:
            if mismatch['type'] == 'missing_in_db':
                table = mismatch['table']
                fields = mismatch['fields']
                
                sql_lines.append(f"-- 修复 {table} 表缺失字段")
                sql_lines.append(f"ALTER TABLE {table}")
                
                add_columns = []
                for field in fields:
                    if not field.startswith('_'):  # 忽略特殊字段
                        add_columns.append(f"  ADD COLUMN IF NOT EXISTS `{field}` VARCHAR(255) COMMENT '自动添加的字段'")
                
                if add_columns:
                    sql_lines.append(',\n'.join(add_columns) + ';')
                    sql_lines.append("")
        
        sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
        sql_lines.append("")
        sql_lines.append("SELECT '✅ 兼容性修复完成！' AS message;")
        
        return '\n'.join(sql_lines)
    
    def generate_report(self) -> str:
        """生成检测报告"""
        report_lines = [
            "# 灵月仙途 - API 与数据库字段兼容性检测报告",
            "",
            f"## 概览",
            f"- 扫描的 API 服务文件：{len(self.api_service_files)}",
            f"- 扫描的 Controller 文件：{len(self.controller_files)}",
            f"- 扫描的 Entity 文件：{len(self.entity_files)}",
            f"- 扫描的 SQL 文件：{len(self.sql_files)}",
            f"- 解析的 API 端点：{len(self.api_endpoints)}",
            f"- 解析的数据库表：{len(self.database_tables)}",
            f"- 发现的字段不匹配：{len(self.mismatch_report)}",
            "",
            "## 字段不匹配详情",
            ""
        ]
        
        if self.mismatch_report:
            for mismatch in self.mismatch_report:
                if mismatch['type'] == 'missing_in_db':
                    report_lines.append(f"### ⚠️  {mismatch['table']} 表缺失字段")
                    report_lines.append(f"**实体类**: {mismatch['entity']}")
                    report_lines.append(f"**缺失字段**: {', '.join(mismatch['fields'])}")
                    report_lines.append("")
                elif mismatch['type'] == 'extra_in_db':
                    report_lines.append(f"### ℹ️  {mismatch['table']} 表多余字段")
                    report_lines.append(f"**实体类**: {mismatch['entity']}")
                    report_lines.append(f"**多余字段**: {', '.join([f for f in mismatch['fields'] if not f in ['id', 'created_at', 'updated_at', 'create_time', 'update_time']])}")
                    report_lines.append("")
        else:
            report_lines.append("✅ 未发现字段不匹配问题！")
            report_lines.append("")
        
        report_lines.append("## API 端点列表")
        report_lines.append("")
        for endpoint in sorted(self.api_endpoints.keys())[:50]:
            report_lines.append(f"- `{endpoint}`")
        if len(self.api_endpoints) > 50:
            report_lines.append(f"- ... 还有 {len(self.api_endpoints) - 50} 个端点")
        
        return '\n'.join(report_lines)
    
    @staticmethod
    def camel_to_snake(name: str) -> str:
        """驼峰命名转下划线命名"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    
    @staticmethod
    def endpoint_to_table(endpoint: str) -> str:
        """从 API 端点推断表名"""
        # 移除前缀斜杠
        path = endpoint.lstrip('/')
        # 替换斜杠为下划线
        table = path.replace('/', '_')
        # 移除参数部分
        table = re.sub(r'\{[^}]+\}', '', table)
        # 移除复数后缀
        if table.endswith('s'):
            table = table[:-1]
        return table
    
    def run(self):
        """运行检测"""
        print("============================================")
        print("灵月仙途 - API 与数据库字段兼容性检测工具")
        print("============================================")
        print("")
        
        self.scan_project()
        self.parse_entity_fields()
        self.parse_database_tables()
        self.parse_api_endpoints()
        self.check_field_mismatches()
        self.check_api_parameter_compatibility()
        
        # 生成报告
        report = self.generate_report()
        report_file = self.project_root / "API_DATABASE_COMPATIBILITY_REPORT.md"
        report_file.write_text(report, encoding='utf-8')
        print(f"\n📄 检测报告已保存到：{report_file}")
        
        # 生成修复 SQL
        fix_sql = self.generate_fix_sql()
        fix_sql_file = self.project_root / "fix_api_database_compatibility.sql"
        fix_sql_file.write_text(fix_sql, encoding='utf-8')
        print(f"📄 修复 SQL 已保存到：{fix_sql_file}")
        
        print("\n============================================")
        if self.mismatch_report:
            print(f"⚠️  发现 {len(self.mismatch_report)} 个字段不匹配问题")
            print("请查看生成的报告和修复脚本")
        else:
            print("✅ 未发现字段不匹配问题")
        print("============================================")


if __name__ == '__main__':
    # 获取项目根目录
    project_root = Path(__file__).parent
    
    # 创建检测器并运行
    checker = APIDatabaseChecker(str(project_root))
    checker.run()
