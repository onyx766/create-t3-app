/**
 * Test script to reproduce the "dubious ownership" error bug
 *
 * This simulates what happens when Git throws a "dubious ownership" error
 * on Windows drives (F:/, E:/) or network shares.
 */

console.log("🔍 REPRODUCING THE BUG\n");
console.log("=".repeat(60));

// Simulate the current buggy code
async function testBuggyVersion() {
  console.log("\n❌ CURRENT BUGGY BEHAVIOR:");
  console.log("-".repeat(60));

  try {
    // This simulates what happens when git throws dubious ownership error
    throw new Error(`Command failed with exit code 128: git init
fatal: detected dubious ownership in repository at 'F:/test/ct3a'
'F:/test/ct3a' is on a file system that does not record ownership
To add an exception for this directory, call:

    git config --global --add safe.directory F:/test/ct3a`);
  } catch {
    // THIS IS THE BUG - catches error but doesn't look at it!
    console.log(
      "❌ Failed: could not initialize git. Update git to the latest version!",
    );
    console.log("   ↑ USELESS MESSAGE - doesn't tell user the real problem!\n");
  }
}

// Proposed fixed version
async function testFixedVersion() {
  console.log("\n✅ PROPOSED FIX:");
  console.log("-".repeat(60));

  try {
    // This simulates what happens when git throws dubious ownership error
    throw new Error(`Command failed with exit code 128: git init
fatal: detected dubious ownership in repository at 'F:/test/ct3a'
'F:/test/ct3a' is on a file system that does not record ownership
To add an exception for this directory, call:

    git config --global --add safe.directory F:/test/ct3a`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("dubious ownership")) {
      console.log("❌ Failed: Git detected dubious ownership in repository.\n");
      console.log(
        "Cause: The file system doesn't record ownership (FAT32, exFAT, network drive).",
      );
      console.log(
        "This is common on external drives, USB drives, and Windows network shares.\n",
      );
      console.log("To fix this, run:");
      console.log(
        '  git config --global --add safe.directory "F:/test/ct3a"\n',
      );
      console.log("Or to trust all repositories:");
      console.log("  git config --global --add safe.directory '*'\n");
      console.log(
        "   ↑ HELPFUL MESSAGE - clearly explains FAT32/exFAT ownership issue!",
      );
    } else {
      console.log(`❌ Failed: could not initialize git.`);
      console.log(`Error: ${errorMessage}`);
    }
  }
}

// Show where in the code this happens
console.log("\n📍 WHERE THE BUG IS IN THE CODE:");
console.log("-".repeat(60));
console.log("File: cli/src/helpers/git.ts");
console.log("\n🐛 Line 26-38 - isInsideGitRepo() function:");
console.log(`
  } catch {  // ❌ Ignores error silently
    return false;
  }
`);

console.log("\n🐛 Line 127-136 - initializeGit() function:");
console.log(`
  } catch {  // ❌ Catches error but doesn't examine it!
    spinner.fail(
      "Failed: could not initialize git. Update git to the latest version!"
    );
  }
`);

console.log("\n" + "=".repeat(60));
console.log("DEMONSTRATION:\n");

await testBuggyVersion();
await testFixedVersion();

console.log("=".repeat(60));
