import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/exhibit_provider.dart';
import '../providers/sync_provider.dart';
import '../models/exhibit.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  String _selectedTimeRange = '7d';
  String _selectedChartType = 'category';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExhibitProvider>().refreshExhibits();
      context.read<SyncProvider>().refreshSyncStatus();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics & Reports'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: _exportReport,
            tooltip: 'Export Report',
          ),
        ],
      ),
      body: Consumer2<ExhibitProvider, SyncProvider>(
        builder: (context, exhibitProvider, syncProvider, child) {
          if (exhibitProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (exhibitProvider.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 16),
                  Text('Error: ${exhibitProvider.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => exhibitProvider.refreshExhibits(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              await exhibitProvider.refreshExhibits();
              await syncProvider.refreshSyncStatus();
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildTimeRangeSelector(),
                  const SizedBox(height: 24),
                  _buildOverviewCards(exhibitProvider, syncProvider),
                  const SizedBox(height: 24),
                  _buildChartSelector(),
                  const SizedBox(height: 16),
                  _buildChart(exhibitProvider),
                  const SizedBox(height: 24),
                  _buildDetailedStats(exhibitProvider),
                  const SizedBox(height: 24),
                  _buildSyncAnalytics(syncProvider),
                  const SizedBox(height: 24),
                  _buildRecentActivity(exhibitProvider, syncProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeRangeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Time Range',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                '1d', '7d', '30d', '90d', '1y'
              ].map((range) {
                final isSelected = _selectedTimeRange == range;
                return FilterChip(
                  label: Text(_getTimeRangeLabel(range)),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() => _selectedTimeRange = range);
                  },
                  selectedColor: Theme.of(context).colorScheme.primaryContainer,
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewCards(ExhibitProvider exhibitProvider, SyncProvider syncProvider) {
    final stats = exhibitProvider.stats;
    final totalExhibits = stats['total'] ?? 0;
    final pendingSync = stats['pending'] ?? 0;
    final synced = stats['synced'] ?? 0;

    return Row(
      children: [
        Expanded(
          child: _buildOverviewCard(
            'Total Exhibits',
            '$totalExhibits',
            Icons.museum,
            Colors.blue,
            'All exhibits in the system',
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildOverviewCard(
            'Pending Sync',
            '$pendingSync',
            Icons.schedule,
            Colors.orange,
            'Exhibits waiting to sync',
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildOverviewCard(
            'Synced',
            '$synced',
            Icons.sync,
            Colors.green,
            'Successfully synchronized',
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewCard(String title, String value, IconData icon, Color color, String subtitle) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 12),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartSelector() {
    return Row(
      children: [
        Expanded(
          child: FilterChip(
            label: const Text('By Category'),
            selected: _selectedChartType == 'category',
            onSelected: (selected) {
              setState(() => _selectedChartType = 'category');
            },
            selectedColor: Theme.of(context).colorScheme.primaryContainer,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: FilterChip(
            label: const Text('By Location'),
            selected: _selectedChartType == 'location',
            onSelected: (selected) {
              setState(() => _selectedChartType = 'location');
            },
            selectedColor: Theme.of(context).colorScheme.primaryContainer,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: FilterChip(
            label: const Text('By Time'),
            selected: _selectedChartType == 'time',
            onSelected: (selected) {
              setState(() => _selectedChartType = 'time');
            },
            selectedColor: Theme.of(context).colorScheme.primaryContainer,
          ),
        ),
      ],
    );
  }

  Widget _buildChart(ExhibitProvider exhibitProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _getChartTitle(),
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 300,
              child: _selectedChartType == 'time'
                  ? _buildTimeChart(exhibitProvider)
                  : _buildPieChart(exhibitProvider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPieChart(ExhibitProvider exhibitProvider) {
    final chartData = _getChartData(exhibitProvider);
    
    if (chartData.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.pie_chart, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No data available',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      );
    }

    return PieChart(
      PieChartData(
        sections: chartData.map((data) {
          return PieChartSectionData(
            color: data.color,
            value: data.value.toDouble(),
            title: '${data.label}\n${data.value}',
            radius: 80,
            titleStyle: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          );
        }).toList(),
        centerSpaceRadius: 40,
        sectionsSpace: 2,
      ),
    );
  }

  Widget _buildTimeChart(ExhibitProvider exhibitProvider) {
    final timeData = _getTimeChartData(exhibitProvider);
    
    if (timeData.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.timeline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No time data available',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      );
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(value.toInt().toString());
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < timeData.length) {
                  return Text(timeData[value.toInt()].label);
                }
                return const Text('');
              },
            ),
          ),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: true),
        lineBarsData: [
          LineChartBarData(
            spots: timeData.asMap().entries.map((entry) {
              return FlSpot(entry.key.toDouble(), entry.value.value.toDouble());
            }).toList(),
            isCurved: true,
            color: Theme.of(context).colorScheme.primary,
            barWidth: 3,
            dotData: FlDotData(show: true),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedStats(ExhibitProvider exhibitProvider) {
    final exhibits = exhibitProvider.exhibits;
    final categoryStats = _getCategoryStats(exhibits);
    final locationStats = _getLocationStats(exhibits);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detailed Statistics',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStatsTable('By Category', categoryStats),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: _buildStatsTable('By Location', locationStats),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsTable(String title, Map<String, int> stats) {
    final sortedStats = stats.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: sortedStats.take(5).map((entry) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        entry.key,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ),
                    Text(
                      '${entry.value}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildSyncAnalytics(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sync Analytics',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildSyncMetric(
                    'Sync Success Rate',
                    '${_calculateSyncSuccessRate(syncProvider)}%',
                    Icons.check_circle,
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSyncMetric(
                    'Average Sync Time',
                    '${_calculateAverageSyncTime(syncProvider)}s',
                    Icons.timer,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSyncMetric(
                    'Last Sync',
                    syncProvider.lastSyncTime ?? 'Never',
                    Icons.access_time,
                    Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncMetric(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(ExhibitProvider exhibitProvider, SyncProvider syncProvider) {
    final recentExhibits = exhibitProvider.exhibits
        .where((e) => e.isRecentlyCreated || e.isRecentlyUpdated)
        .take(5)
        .toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            if (recentExhibits.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(Icons.history, size: 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No recent activity',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: recentExhibits.length,
                itemBuilder: (context, index) {
                  final exhibit = recentExhibits[index];
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: exhibit.isRecentlyCreated
                          ? Colors.green[100]
                          : Colors.blue[100],
                      child: Icon(
                        exhibit.isRecentlyCreated ? Icons.add : Icons.edit,
                        color: exhibit.isRecentlyCreated ? Colors.green : Colors.blue,
                      ),
                    ),
                    title: Text(exhibit.name),
                    subtitle: Text(
                      exhibit.isRecentlyCreated
                          ? 'Created ${exhibit.formattedCreatedAt}'
                          : 'Updated ${exhibit.formattedUpdatedAt}',
                    ),
                    trailing: Chip(
                      label: Text(exhibit.category),
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  String _getTimeRangeLabel(String range) {
    switch (range) {
      case '1d':
        return '1 Day';
      case '7d':
        return '7 Days';
      case '30d':
        return '30 Days';
      case '90d':
        return '90 Days';
      case '1y':
        return '1 Year';
      default:
        return range;
    }
  }

  String _getChartTitle() {
    switch (_selectedChartType) {
      case 'category':
        return 'Exhibits by Category';
      case 'location':
        return 'Exhibits by Location';
      case 'time':
        return 'Exhibits Over Time';
      default:
        return 'Chart';
    }
  }

  List<ChartData> _getChartData(ExhibitProvider exhibitProvider) {
    final exhibits = exhibitProvider.exhibits;
    
    if (_selectedChartType == 'category') {
      final categoryStats = _getCategoryStats(exhibits);
      return categoryStats.entries.map((entry) {
        return ChartData(
          label: entry.key,
          value: entry.value,
          color: _getRandomColor(entry.key.hashCode),
        );
      }).toList();
    } else if (_selectedChartType == 'location') {
      final locationStats = _getLocationStats(exhibits);
      return locationStats.entries.map((entry) {
        return ChartData(
          label: entry.key,
          value: entry.value,
          color: _getRandomColor(entry.key.hashCode),
        );
      }).toList();
    }
    
    return [];
  }

  List<ChartData> _getTimeChartData(ExhibitProvider exhibitProvider) {
    final exhibits = exhibitProvider.exhibits;
    final now = DateTime.now();
    final days = _getDaysInRange(now);
    
    return days.map((date) {
      final count = exhibits.where((e) {
        final exhibitDate = DateTime(e.createdAt.year, e.createdAt.month, e.createdAt.day);
        final targetDate = DateTime(date.year, date.month, date.day);
        return exhibitDate.isAtSameMomentAs(targetDate);
      }).length;
      
      return ChartData(
        label: '${date.month}/${date.day}',
        value: count,
        color: Theme.of(context).colorScheme.primary,
      );
    }).toList();
  }

  List<DateTime> _getDaysInRange(DateTime endDate) {
    final days = <DateTime>[];
    final startDate = endDate.subtract(Duration(days: _getDaysFromRange()));
    
    for (int i = 0; i <= _getDaysFromRange(); i++) {
      days.add(startDate.add(Duration(days: i)));
    }
    
    return days;
  }

  int _getDaysFromRange() {
    switch (_selectedTimeRange) {
      case '1d':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '1y':
        return 365;
      default:
        return 7;
    }
  }

  Map<String, int> _getCategoryStats(List<Exhibit> exhibits) {
    final stats = <String, int>{};
    for (final exhibit in exhibits) {
      stats[exhibit.category] = (stats[exhibit.category] ?? 0) + 1;
    }
    return stats;
  }

  Map<String, int> _getLocationStats(List<Exhibit> exhibits) {
    final stats = <String, int>{};
    for (final exhibit in exhibits) {
      stats[exhibit.location] = (stats[exhibit.location] ?? 0) + 1;
    }
    return stats;
  }

  Color _getRandomColor(int seed) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.red,
      Colors.purple,
      Colors.teal,
      Colors.indigo,
      Colors.pink,
    ];
    return colors[seed % colors.length];
  }

  int _calculateSyncSuccessRate(SyncProvider syncProvider) {
    final total = syncProvider.totalExhibits;
    final synced = syncProvider.syncedCount;
    if (total == 0) return 0;
    return ((synced / total) * 100).round();
  }

  int _calculateAverageSyncTime(SyncProvider syncProvider) {
    // This would be calculated from actual sync logs
    // For now, returning a placeholder value
    return 15;
  }

  void _exportReport() {
    // Implementation for exporting analytics report
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}

class ChartData {
  final String label;
  final int value;
  final Color color;

  ChartData({
    required this.label,
    required this.value,
    required this.color,
  });
} 