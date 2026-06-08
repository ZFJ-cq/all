#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
============================================
灵月仙途 - 数据库字段完整性离线检测工具
============================================
用途：
1. 扫描所有 Entity 实体类
2. 扫描所有 SQL 迁移脚本
3. 对比实体类字段与数据库表结构
4. 生成详细的缺失字段报告
5. 自动生成修复 SQL 脚本
"""

import os
import re
from pathlib import Path
from typing import Dict, Set, List, Tuple
from datetime import datetime

class OfflineDatabaseChecker:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.entity_files = []
        self.sql_files = []
        self.entity_fields = {}  # {表名：{字段集合}}
        self.database_fields = {}  # {表名：{字段集合}}
        self.missing_fields = {}  # {表名：[缺失字段]}
        
    def scan_files(self):
        """扫描项目文件"""
        print("📂 扫描项目文件...")
        
        # 扫描 Entity 文件
        entity_dir = self.project_root / "lingyuexiantu-server" / "src" / "main" / "java" / "com" / "lingyue" / "entity"
        if entity_dir.exists():
            self.entity_files = list(entity_dir.glob("*.java"))
            print(f"  找到 {len(self.entity_files)} 个 Entity 文件")
        
        # 扫描 SQL 文件
        sql_dirs = [
            self.project_root / "lingyuexiantu-server" / "src" / "main" / "resources" / "db" / "migration",
            self.project_root / "lingyuexiantu-server" / "src" / "main" / "resources" / "data",
            self.project_root
        ]
        
        for sql_dir in sql_dirs:
            if sql_dir.exists():
                files = list(sql_dir.glob("**/*.sql"))
                self.sql_files.extend(files)
        
        # 去重
        self.sql_files = list(set(self.sql_files))
        print(f"  找到 {len(self.sql_files)} 个 SQL 文件")
        print("")
        
    def parse_entity(self, entity_file: Path) -> Tuple[str, Set[str]]:
        """解析单个 Entity 文件"""
        try:
            content = entity_file.read_text(encoding='utf-8')
            
            # 获取表名
            table_match = re.search(r'@Table\(name\s*=\s*"([^"]+)"', content)
            if not table_match:
                # 如果没有@Table 注解，从类名推断
                class_match = re.search(r'class\s+(\w+)', content)
                if class_match:
                    class_name = class_match.group(1)
                    table_name = self.camel_to_snake(class_name)
                else:
                    return None, set()
            else:
                table_name = table_match.group(1)
            
            # 获取字段
            fields = set()
            
            # 查找@Column 注解
            column_matches = re.findall(r'@Column\(name\s*=\s*"([^"]+)"', content)
            fields.update(column_matches)
            
            # 查找普通字段声明
            field_matches = re.findall(r'(?:private|protected|public)\s+(?:final\s+)?(\w+)\s+(\w+)\s*;', content)
            for field_type, field_name in field_matches:
                if field_name not in ['serialVersionUID']:  # 排除特殊字段
                    # 驼峰转下划线
                    db_field = self.camel_to_snake(field_name)
                    fields.add(db_field)
            
            return table_name, fields
            
        except Exception as e:
            print(f"  ⚠️  解析 {entity_file.name} 失败：{e}")
            return None, set()
    
    def parse_entities(self):
        """解析所有 Entity 文件"""
        print("📋 解析 Entity 类字段...")
        
        for entity_file in self.entity_files:
            table_name, fields = self.parse_entity(entity_file)
            if table_name:
                self.entity_fields[table_name] = fields
                print(f"  ✓ {table_name}: {len(fields)} 个字段")
        
        print(f"  共解析 {len(self.entity_fields)} 个表")
        print("")
    
    def parse_sql(self, sql_file: Path):
        """解析 SQL 文件中的表结构"""
        try:
            content = sql_file.read_text(encoding='utf-8')
            
            # 查找 CREATE TABLE 语句
            create_pattern = r'CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?\s*\(([^;]+?)\)(?:\s*ENGINE|\s*;|\s*$)'
            matches = re.findall(create_pattern, content, re.DOTALL | re.IGNORECASE)
            
            for table_name, columns_def in matches:
                if table_name not in self.database_fields:
                    self.database_fields[table_name] = set()
                
                # 解析列定义 (简化版)
                lines = columns_def.split('\n')
                for line in lines:
                    line = line.strip()
                    # 跳过索引、主键等定义
                    if line.startswith(('PRIMARY', 'KEY', 'INDEX', 'UNIQUE', 'FOREIGN', 'CONSTRAINT')):
                        continue
                    
                    # 提取列名
                    col_match = re.match(r'`?(\w+)`?\s+\w+', line)
                    if col_match:
                        col_name = col_match.group(1)
                        self.database_fields[table_name].add(col_name)
                
        except Exception as e:
            pass
    
    def parse_sql_files(self):
        """解析所有 SQL 文件"""
        print("📋 解析 SQL 文件表结构...")
        
        for sql_file in self.sql_files:
            self.parse_sql(sql_file)
        
        print(f"  解析到 {len(self.database_fields)} 个表")
        for table_name in list(self.database_fields.keys())[:10]:
            fields = self.database_fields[table_name]
            print(f"    - {table_name}: {len(fields)} 个字段")
        if len(self.database_fields) > 10:
            print(f"    ... 还有 {len(self.database_fields) - 10} 个表")
        print("")
    
    def compare_fields(self):
        """对比 Entity 和数据库字段"""
        print("🔍 对比字段差异...")
        
        for table_name, entity_fields in self.entity_fields.items():
            db_fields = self.database_fields.get(table_name, set())
            
            # 找出 Entity 有但数据库没有的字段
            missing = entity_fields - db_fields
            
            # 过滤掉一些通用字段
            common_fields = {'id', 'created_at', 'updated_at', 'create_time', 'update_time', 'version'}
            missing = missing - common_fields
            
            if missing:
                self.missing_fields[table_name] = list(missing)
                print(f"  ⚠️  {table_name}: 缺失 {len(missing)} 个字段")
        
        print("")
        if not self.missing_fields:
            print("  ✅ 未发现字段缺失！")
        else:
            print(f"  共发现 {len(self.missing_fields)} 个表存在字段缺失")
        print("")
    
    def generate_fix_sql(self) -> str:
        """生成修复 SQL 脚本"""
        sql_lines = [
            "-- ============================================",
            "-- 数据库字段缺失修复脚本",
            f"-- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "-- ============================================",
            "",
            "SET FOREIGN_KEY_CHECKS = 0;",
            ""
        ]
        
        for table_name, fields in self.missing_fields.items():
            sql_lines.append(f"-- 修复 {table_name} 表缺失字段")
            sql_lines.append(f"ALTER TABLE {table_name}")
            
            add_columns = []
            for field in fields:
                if not field.startswith('_'):
                    add_columns.append(f"  ADD COLUMN IF NOT EXISTS `{field}` VARCHAR(255) COMMENT '自动补充字段'")
            
            if add_columns:
                sql_lines.append(',\n'.join(add_columns) + ';')
                sql_lines.append("")
        
        sql_lines.extend([
            "SET FOREIGN_KEY_CHECKS = 1;",
            "",
            "SELECT '✅ 数据库字段修复完成！' AS message;"
        ])
        
        return '\n'.join(sql_lines)
    
    def generate_report(self) -> str:
        """生成检测报告"""
        report_lines = [
            "# 灵月仙途 - 数据库字段完整性检测报告",
            "",
            f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "## 📊 扫描统计",
            "",
            f"- Entity 文件：{len(self.entity_files)} 个",
            f"- SQL 文件：{len(self.sql_files)} 个",
            f"- 解析的表：{len(self.entity_fields)} 个",
            f"- 发现缺失：{len(self.missing_fields)} 个表",
            "",
            "## 🔍 缺失字段详情",
            ""
        ]
        
        if self.missing_fields:
            for table_name, fields in sorted(self.missing_fields.items()):
                report_lines.append(f"### {table_name} 表")
                report_lines.append("")
                report_lines.append(f"**缺失字段**: {', '.join(fields)}")
                report_lines.append("")
                report_lines.append("```sql")
                report_lines.append(f"ALTER TABLE {table_name}")
                add_cols = [f"ADD COLUMN `{f}` VARCHAR(255)" for f in fields if not f.startswith('_')]
                report_lines.append(',\n'.join(add_cols) + ';')
                report_lines.append("```")
                report_lines.append("")
        else:
            report_lines.append("✅ 所有表的字段都完整！")
            report_lines.append("")
        
        report_lines.extend([
            "## 📋 已扫描的表清单",
            "",
        ])
        
        for table_name in sorted(self.entity_fields.keys()):
            field_count = len(self.entity_fields[table_name])
            report_lines.append(f"- `{table_name}` ({field_count} 个字段)")
        
        return '\n'.join(report_lines)
    
    @staticmethod
    def camel_to_snake(name: str) -> str:
        """驼峰命名转下划线命名"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    
    def run(self):
        """运行检测"""
        print("============================================")
        print("灵月仙途 - 数据库字段完整性检测工具")
        print("============================================")
        print("")
        
        self.scan_files()
        self.parse_entities()
        self.parse_sql_files()
        self.compare_fields()
        
        # 生成报告
        report = self.generate_report()
        report_file = self.project_root / "DATABASE_FIELD_REPORT.md"
        report_file.write_text(report, encoding='utf-8')
        print(f"📄 检测报告：{report_file}")
        
        # 生成修复 SQL
        fix_sql = self.generate_fix_sql()
        fix_sql_file = self.project_root / "fix_missing_fields.sql"
        fix_sql_file.write_text(fix_sql, encoding='utf-8')
        print(f"📄 修复脚本：{fix_sql_file}")
        
        print("")
        print("============================================")
        if self.missing_fields:
            print(f"⚠️  发现 {len(self.missing_fields)} 个表存在字段缺失")
            print("请查看生成的报告和修复脚本")
        else:
            print("✅ 所有表字段完整")
        print("============================================")


if __name__ == '__main__':
    project_root = Path(__file__).parent
    checker = OfflineDatabaseChecker(str(project_root))
    checker.run()
