# Members Fetch Guide - Simplified Solution

## Problem

When trying to fetch all 1500 parliament members at once, the Parliament UK API returns a 429 (Too Many Requests) error.

## Solution

Implemented a simple endpoint that:

- **Fetches 15 members at a time**
- **Saves progress** in a single JSON file
- **Resumes from the last processed page** on failures
- **Waits 3 seconds** between pages
- **Waits 1 minute** before retry on errors
- **Uploads to WordPress** at the end

## File Structure

```
members.json
├── totalMembers: 1500
├── processedPages: 50
├── lastProcessedPage: 50
├── status: "in_progress"
└── items: [...] // all processed members
```

## API Endpoint

### Single Endpoint

```bash
POST /api/v1/members/fetch-all-with-ai
```

**What it does:**

1. Fetches all members in batches of 15
2. Processes each through AI
3. Saves to `members.json`
4. Resumes from interruption point on failures
5. Uploads to WordPress at the end

## How Recovery Works

1. **On startup** - checks `members.json`
2. **If progress exists** - continues from the last page
3. **On error** - waits 1 minute and retries the same page
4. **After completion** - uploads to WordPress

## Logs

The system outputs:

- Start/resume from specific page
- Progress of each page processing
- Errors and retry attempts
- Completion and WordPress upload

## Recommendations

1. **Don't interrupt the process** - can be resumed
2. **Monitor logs** to track progress
3. **Execution time** ~30-40 minutes for all 1500 members
4. **On failures** - just restart, will continue from interruption point

## Troubleshooting

### If the process crashed

```bash
# Just restart - will continue from interruption point
curl -X POST "http://localhost:3000/api/v1/members/fetch-all-with-ai"
```

### If you want to start from the beginning

1. Delete the `members.json` file
2. Restart the endpoint
